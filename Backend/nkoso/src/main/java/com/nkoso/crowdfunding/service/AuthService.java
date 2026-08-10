package com.nkoso.crowdfunding.service;

import com.nkoso.crowdfunding.dto.AuthResponse;
import com.nkoso.crowdfunding.dto.LoginRequest;
import com.nkoso.crowdfunding.dto.RegisterRequest;
import com.nkoso.crowdfunding.entity.User;
import com.nkoso.crowdfunding.exception.DuplicateResourceException;
import com.nkoso.crowdfunding.exception.UnauthorizedException;
import com.nkoso.crowdfunding.repository.UserRepository;
import com.nkoso.crowdfunding.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken");
        }

        User user = new User(
                request.getEmail(),
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                User.Role.USER
        );

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // Unique-constraint race on email or username
            throw new DuplicateResourceException("Email or username already taken");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getUsername(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier();
        User user;

        // Usernames are restricted to [a-zA-Z0-9_], so an '@' unambiguously
        // marks the identifier as an email.
        if (identifier.contains("@")) {
            user = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new UnauthorizedException("Invalid email/username or password"));
        } else {
            user = userRepository.findByUsername(identifier)
                    .orElseThrow(() -> new UnauthorizedException("Invalid email/username or password"));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email/username or password");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getUsername(), user.getRole().name());
    }

}