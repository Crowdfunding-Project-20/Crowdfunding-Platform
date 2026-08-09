package com.nkoso.crowdfunding.controller;

import com.nkoso.crowdfunding.dto.AdminDashboardResponse;
import com.nkoso.crowdfunding.dto.CreatorDashboardResponse;
import com.nkoso.crowdfunding.entity.User;
import com.nkoso.crowdfunding.exception.ResourceNotFoundException;
import com.nkoso.crowdfunding.repository.UserRepository;
import com.nkoso.crowdfunding.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Dashboard and analytics for creators and admins")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    public AnalyticsController(AnalyticsService analyticsService,
                               UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
    }

    @GetMapping("/creator")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Creator dashboard", description = "Get analytics for your own campaigns (creator only).")
    public ResponseEntity<CreatorDashboardResponse> getCreatorDashboard() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(analyticsService.getCreatorDashboard(currentUser.getId()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin dashboard", description = "Get platform-wide analytics (admin only).")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(analyticsService.getAdminDashboard());
    }

    private User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

}