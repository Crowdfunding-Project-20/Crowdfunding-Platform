package com.nkoso.crowdfunding.controller;

import com.nkoso.crowdfunding.dto.AuthResponse;
import com.nkoso.crowdfunding.dto.ChangePasswordRequest;
import com.nkoso.crowdfunding.dto.UpdateProfileRequest;
import com.nkoso.crowdfunding.dto.UserResponse;
import com.nkoso.crowdfunding.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "View and edit the current user's profile")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private String currentEmail() {
        return (String) SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/me")
    @Operation(summary = "Get my profile", description = "Current user's account details")
    public ResponseEntity<UserResponse> getMyProfile() {
        return ResponseEntity.ok(userService.getProfile(currentEmail()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update my profile", description = "Update email/username. Returns a fresh token.")
    public ResponseEntity<AuthResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(currentEmail(), request));
    }

    @PostMapping("/me/password")
    @Operation(summary = "Change my password", description = "Verify current password, then set a new one.")
    public ResponseEntity<Map<String, String>> changeMyPassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(currentEmail(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
