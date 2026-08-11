package com.nkoso.crowdfunding.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

/**
 * Partial profile update payload.
 *
 * Both fields are optional so the client can save one field at a time — a null
 * field means "leave this alone". @Email and @Pattern both skip nulls, so the
 * constraints only fire on fields the client actually sent.
 */
@Schema(description = "Profile update payload — send only the fields you want to change")
public class UpdateProfileRequest {

    @Email(message = "Email must be valid")
    @Schema(description = "New email address", example = "user@example.com")
    private String email;

    @Pattern(regexp = "^[a-zA-Z0-9_]{3,30}$", message = "Username must be 3-30 characters, alphanumeric or underscores only")
    @Schema(description = "New username (3-30 chars, alphanumeric or underscores)", example = "john_doe")
    private String username;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String email, String username) {
        this.email = email;
        this.username = username;
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

}
