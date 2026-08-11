package com.nkoso.crowdfunding.service;

import com.nkoso.crowdfunding.dto.AuthResponse;
import com.nkoso.crowdfunding.dto.ChangePasswordRequest;
import com.nkoso.crowdfunding.dto.UpdateProfileRequest;
import com.nkoso.crowdfunding.dto.UserResponse;
import com.nkoso.crowdfunding.entity.User;
import com.nkoso.crowdfunding.exception.BadRequestException;
import com.nkoso.crowdfunding.exception.DuplicateResourceException;
import com.nkoso.crowdfunding.exception.ResourceNotFoundException;
import com.nkoso.crowdfunding.repository.UserRepository;
import com.nkoso.crowdfunding.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse getProfile(String email) {
        User user = findByEmail(email);
        return new UserResponse(user.getEmail(), user.getUsername(),
                user.getRole().name(), user.getCreatedAt());
    }

    public AuthResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmail(email);

        // Same-value skip: only conflict-check + assign when the value actually
        // changed, so re-saving the current email/username is a no-op.
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email already registered");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new DuplicateResourceException("Username already taken");
            }
            user.setUsername(request.getUsername());
        }

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // Unique-constraint race between the existsBy check and save
            throw new DuplicateResourceException("Email or username already taken");
        }

        // Email is the JWT subject — emit a fresh token so the client can
        // update its session directly and stay authenticated.
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getUsername(), user.getRole().name());
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmail(email);

        // 400, not 401 — the frontend treats any 401 as an expired session and
        // would log the user out for a mistyped current password.
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
