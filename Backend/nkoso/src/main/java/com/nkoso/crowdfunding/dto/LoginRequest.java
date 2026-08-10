package com.nkoso.crowdfunding.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Login request payload")
public class LoginRequest {

    @NotBlank(message = "Email or username is required")
    @Schema(description = "User email address or username", example = "user@example.com")
    private String identifier;

    @NotBlank(message = "Password is required")
    @Schema(description = "User password", example = "password123")
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String identifier, String password) {
        this.identifier = identifier;
        this.password = password;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}