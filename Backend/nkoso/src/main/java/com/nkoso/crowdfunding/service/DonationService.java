package com.nkoso.crowdfunding.service;

import com.nkoso.crowdfunding.dto.DonationRequest;
import com.nkoso.crowdfunding.dto.DonationResponse;
import com.nkoso.crowdfunding.entity.Campaign;
import com.nkoso.crowdfunding.entity.Donation;
import com.nkoso.crowdfunding.entity.PlatformSettings;
import com.nkoso.crowdfunding.entity.User;
import com.nkoso.crowdfunding.exception.ResourceNotFoundException;
import com.nkoso.crowdfunding.repository.CampaignRepository;
import com.nkoso.crowdfunding.repository.DonationRepository;
import com.nkoso.crowdfunding.repository.PlatformSettingsRepository;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;
    private final PlatformSettingsRepository platformSettingsRepository;

    public DonationService(DonationRepository donationRepository,
                           CampaignRepository campaignRepository,
                           PlatformSettingsRepository platformSettingsRepository) {
        this.donationRepository = donationRepository;
        this.campaignRepository = campaignRepository;
        this.platformSettingsRepository = platformSettingsRepository;
    }

    @Transactional
    public DonationResponse createDonation(DonationRequest request, User backer) {
        Campaign campaign = campaignRepository.findById(request.getCampaignId())
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + request.getCampaignId()));

        PlatformSettings settings = platformSettingsRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Platform settings not configured"));

        Donation donation = new Donation();
        donation.setCampaign(campaign);
        donation.setBacker(backer);
        donation.setAmount(request.getAmount());
        donation.setFeePercentSnapshot(settings.getFeePercent());
        donation.setAnonymous(request.getAnonymous() != null && request.getAnonymous());

        donation = donationRepository.save(donation);

        campaign.setTotalCollected(campaign.getTotalCollected().add(request.getAmount()));
        campaignRepository.save(campaign);

        return mapToResponse(donation);
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getDonationsByBacker(User backer) {
        return donationRepository.findByBackerId(backer.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Public backer list for a campaign. Every donation appears here (newest
     * first), but anonymous donations have their attribution stripped — the
     * amount still shows, only the backer's name is hidden (rendered as
     * "Anonymous" by the frontend).
     */
    @Transactional(readOnly = true)
    public List<DonationResponse> getPublicDonationsForCampaign(Long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        if (campaign.getStatus() == Campaign.CampaignStatus.DELETED) {
            throw new ResourceNotFoundException("Campaign not found with id: " + campaignId);
        }

        return donationRepository.findByCampaignIdOrderByTimestampDesc(campaignId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private DonationResponse mapToResponse(Donation donation) {
        User backer = donation.getBacker();
        // Anonymous donors' names are never exposed — the frontend shows
        // "Anonymous" instead. The amount and the anonymous flag still come back.
        String username = donation.isAnonymous()
                ? null
                : (backer.getUsername() != null
                        ? backer.getUsername()
                        : backer.getEmail().split("@")[0]);
        return new DonationResponse(
                donation.getId(),
                donation.getCampaign().getId(),
                donation.getAmount(),
                donation.getFeePercentSnapshot(),
                donation.getTimestamp(),
                username,
                donation.isAnonymous()
        );
    }

}