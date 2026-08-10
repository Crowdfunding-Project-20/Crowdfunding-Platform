package com.nkoso.crowdfunding.config;

import com.nkoso.crowdfunding.entity.User;
import com.nkoso.crowdfunding.repository.UserRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.util.List;

/**
 * Backfills usernames for users created before the username field existed.
 *
 * The column is created nullable so existing rows survive the ddl-auto=update
 * migration; this component derives a username from each email's local part
 * at startup so no user is left with a NULL username.
 */
@Component
public class UserDataInitializer {

    private final UserRepository userRepository;

    public UserDataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    @Transactional
    public void backfillUsernames() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getUsername() == null || user.getUsername().isBlank()) {
                user.setUsername(deriveUniqueUsername(user));
                userRepository.save(user);
            }
        }
    }

    private String deriveUniqueUsername(User user) {
        // Use the email local part (e.g. "john.doe" from "john.doe@x.com"),
        // sanitized to alphanumerics/underscores, then ensure uniqueness.
        String prefix = user.getEmail().split("@")[0];
        String candidate = prefix.replaceAll("[^a-zA-Z0-9_]", "_");
        if (candidate.length() < 3) {
            candidate = candidate + "_user";
        }
        if (candidate.length() > 30) {
            candidate = candidate.substring(0, 30);
        }

        String finalName = candidate;
        long suffix = user.getId() == null ? 1L : user.getId();
        while (userRepository.existsByUsername(finalName)) {
            finalName = candidate + "_" + suffix;
            suffix++;
        }
        return finalName;
    }
}