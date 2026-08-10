package com.nkoso.crowdfunding.controller;

import com.nkoso.crowdfunding.dto.CampaignRequest;
import com.nkoso.crowdfunding.dto.CampaignResponse;
import com.nkoso.crowdfunding.dto.WithdrawRequest;
import com.nkoso.crowdfunding.entity.User;
import com.nkoso.crowdfunding.exception.ResourceNotFoundException;
import com.nkoso.crowdfunding.repository.UserRepository;
import com.nkoso.crowdfunding.service.CampaignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campaigns")
@Tag(name = "Campaigns", description = "Create, view, update, and manage campaigns")
public class CampaignController {

    private final CampaignService campaignService;
    private final UserRepository userRepository;

    public CampaignController(CampaignService campaignService,
                              UserRepository userRepository) {
        this.campaignService = campaignService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    @Operation(summary = "List active campaigns", description = "Get all active campaigns (public).")
    public ResponseEntity<List<CampaignResponse>> getAllActiveCampaigns() {
        return ResponseEntity.ok(campaignService.getAllActiveCampaigns());
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Get campaign by ID", description = "Get a single campaign's details (public).")
    public ResponseEntity<CampaignResponse> getCampaignById(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @PostMapping
    @Operation(summary = "Create campaign", description = "Create a new campaign (authenticated users).")
    public ResponseEntity<CampaignResponse> createCampaign(
            @Valid @RequestBody CampaignRequest request) {
        CampaignResponse response = campaignService.createCampaign(request, getCurrentUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update campaign", description = "Update your own campaign (creator only).")
    public ResponseEntity<CampaignResponse> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CampaignRequest request) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, request, getCurrentUser()));
    }

    @GetMapping("/my")
    @Operation(summary = "My campaigns", description = "Get all campaigns created by the current user.")
    public ResponseEntity<List<CampaignResponse>> getMyCampaigns() {
        return ResponseEntity.ok(campaignService.getCampaignsByCreator(getCurrentUser().getId()));
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Withdraw funds", description = "Withdraw collected funds from your campaign (creator only).")
    public ResponseEntity<CampaignResponse> withdrawFromCampaign(
            @PathVariable Long id,
            @Valid @RequestBody WithdrawRequest request) {
        return ResponseEntity.ok(campaignService.withdraw(id, request.getAmount(), getCurrentUser()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete campaign", description = "Soft-delete your campaign (creator or admin). Only allowed when all funds have been withdrawn.")
    public ResponseEntity<Map<String, String>> deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id, getCurrentUser());
        return ResponseEntity.ok(Map.of("message", "Campaign deleted successfully"));
    }

    private User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

}