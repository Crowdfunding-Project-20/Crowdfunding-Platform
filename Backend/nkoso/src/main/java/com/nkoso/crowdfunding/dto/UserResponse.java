package com.nkoso.crowdfunding.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "The current user's account details")
public class UserResponse {

    @Schema(description = "User email address", example = "user@example.com")
    private String email;

    @Schema(description = "Unique username", example = "john_doe")
    private String username;

    @Schema(description = "User role (USER or ADMIN)", example = "USER")
    private String role;

    @Schema(description = "When the account was created")
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(String email, String username, String role, LocalDateTime createdAt) {
        this.email = email;
        this.username = username;
        this.role = role;
        this.createdAt = createdAt;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}
