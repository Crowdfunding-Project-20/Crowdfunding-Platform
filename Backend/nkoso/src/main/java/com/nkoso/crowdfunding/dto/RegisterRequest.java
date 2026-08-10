package com.nkoso.crowdfunding.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Registration request payload")
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(description = "User email address", example = "user@example.com")
    private String email;

    @NotBlank(message = "Username is required")
    @Pattern(regexp = "^[a-zA-Z0-9_]{3,30}$", message = "Username must be 3-30 characters, alphanumeric or underscores only")
    @Schema(description = "Unique username (3-30 chars, alphanumeric or underscores)", example = "john_doe")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Schema(description = "User password (min 8 characters)", example = "password123")
    private String password;

    public RegisterRequest() {
    }

    public RegisterRequest(String email, String username, String password) {
        this.email = email;
        this.username = username;
        this.password = password;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}