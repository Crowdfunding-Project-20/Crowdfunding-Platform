package com.nkoso.crowdfunding.controller;

import com.nkoso.crowdfunding.dto.DonationRequest;
import com.nkoso.crowdfunding.dto.DonationResponse;
import com.nkoso.crowdfunding.entity.User;
import com.nkoso.crowdfunding.exception.ResourceNotFoundException;
import com.nkoso.crowdfunding.repository.UserRepository;
import com.nkoso.crowdfunding.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@Tag(name = "Donations", description = "Fund campaigns and view your donation history")
public class DonationController {

    private final DonationService donationService;
    private final UserRepository userRepository;

    public DonationController(DonationService donationService,
                              UserRepository userRepository) {
        this.donationService = donationService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @Operation(summary = "Fund a campaign", description = "Make a donation to a campaign (authenticated users). Simulated payment — always succeeds.")
    public ResponseEntity<DonationResponse> fundCampaign(
            @Valid @RequestBody DonationRequest request) {
        DonationResponse response = donationService.createDonation(request, getCurrentUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @Operation(summary = "My donation history", description = "Get all donations made by the current user.")
    public ResponseEntity<List<DonationResponse>> getMyDonations() {
        return ResponseEntity.ok(donationService.getDonationsByBacker(getCurrentUser()));
    }

    private User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

}