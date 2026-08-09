package com.nkoso.crowdfunding.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication response with JWT token")
public class AuthResponse {

    @Schema(description = "JWT token for authenticated requests", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String token;

    @Schema(description = "Authenticated user's email", example = "user@example.com")
    private String email;

    @Schema(description = "User role (USER or ADMIN)", example = "USER")
    private String role;

    public AuthResponse() {
    }

    public AuthResponse(String token, String email, String role) {
        this.token = token;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

}