package com.nkoso.crowdfunding.controller;

import com.nkoso.crowdfunding.dto.CampaignRequest;
import com.nkoso.crowdfunding.dto.CampaignResponse;
import com.nkoso.crowdfunding.dto.WithdrawRequest;
import com.nkoso.crowdfunding.entity.User;
import com.nkoso.crowdfunding.exception.ResourceNotFoundException;
import com.nkoso.crowdfunding.repository.UserRepository;
import com.nkoso.crowdfunding.service.CampaignService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
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
    public ResponseEntity<List<CampaignResponse>> getAllActiveCampaigns() {
        return ResponseEntity.ok(campaignService.getAllActiveCampaigns());
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<CampaignResponse> getCampaignById(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @PostMapping
    public ResponseEntity<CampaignResponse> createCampaign(
            @Valid @RequestBody CampaignRequest request) {
        CampaignResponse response = campaignService.createCampaign(request, getCurrentUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampaignResponse> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CampaignRequest request) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, request, getCurrentUser()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<CampaignResponse>> getMyCampaigns() {
        return ResponseEntity.ok(campaignService.getCampaignsByCreator(getCurrentUser().getId()));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<CampaignResponse> withdrawFromCampaign(
            @PathVariable Long id,
            @Valid @RequestBody WithdrawRequest request) {
        return ResponseEntity.ok(campaignService.withdraw(id, request.getAmount(), getCurrentUser()));
    }

    private User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

}