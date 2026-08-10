package com.nkoso.crowdfunding.service;

import com.nkoso.crowdfunding.dto.CampaignRequest;
import com.nkoso.crowdfunding.dto.CampaignResponse;
import com.nkoso.crowdfunding.entity.Campaign;
import com.nkoso.crowdfunding.entity.User;
import com.nkoso.crowdfunding.exception.BadRequestException;
import com.nkoso.crowdfunding.exception.ResourceNotFoundException;
import com.nkoso.crowdfunding.exception.UnauthorizedException;
import com.nkoso.crowdfunding.repository.CampaignRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;

    public CampaignService(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    @Transactional
    public CampaignResponse createCampaign(CampaignRequest request, User creator) {
        Campaign campaign = new Campaign();
        campaign.setTitle(request.getTitle());
        campaign.setDescription(request.getDescription());
        campaign.setGoalAmount(request.getGoalAmount());
        campaign.setImageUrl(request.getImageUrl());
        campaign.setStatus(Campaign.CampaignStatus.ACTIVE);
        campaign.setTotalCollected(BigDecimal.ZERO);
        campaign.setTotalWithdrawn(BigDecimal.ZERO);
        campaign.setCreator(creator);

        campaign = campaignRepository.save(campaign);

        return mapToResponse(campaign);
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> getAllActiveCampaigns() {
        return campaignRepository.findByStatus(Campaign.CampaignStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CampaignResponse getCampaignById(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));

        if (campaign.getStatus() == Campaign.CampaignStatus.DELETED) {
            throw new ResourceNotFoundException("Campaign not found with id: " + id);
        }

        return mapToResponse(campaign);
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> getCampaignsByCreator(Long userId) {
        return campaignRepository.findByCreatorId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public CampaignResponse updateCampaign(Long id, CampaignRequest request, User currentUser) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));

        if (!isOwnerOrAdmin(campaign, currentUser)) {
            throw new UnauthorizedException("You are not the creator of this campaign");
        }

        campaign.setTitle(request.getTitle());
        campaign.setDescription(request.getDescription());
        campaign.setGoalAmount(request.getGoalAmount());
        campaign.setImageUrl(request.getImageUrl());

        campaign = campaignRepository.save(campaign);

        return mapToResponse(campaign);
    }

    @Transactional
    public CampaignResponse withdraw(Long campaignId, BigDecimal amount, User currentUser) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        if (!campaign.getCreator().getEmail().equals(currentUser.getEmail())) {
            throw new UnauthorizedException("You are not the creator of this campaign");
        }

        BigDecimal availableBalance = campaign.getTotalCollected().subtract(campaign.getTotalWithdrawn());

        if (amount.compareTo(availableBalance) > 0) {
            throw new BadRequestException("amount greater than withdrawable value");
        }

        campaign.setTotalWithdrawn(campaign.getTotalWithdrawn().add(amount));
        campaign = campaignRepository.save(campaign);

        return mapToResponse(campaign);
    }

    private boolean isOwnerOrAdmin(Campaign campaign, User currentUser) {
        return campaign.getCreator().getEmail().equals(currentUser.getEmail())
                || currentUser.getRole() == User.Role.ADMIN;
    }

    @Transactional
    public CampaignResponse deleteCampaign(Long id, User currentUser) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));

        if (!isOwnerOrAdmin(campaign, currentUser)) {
            throw new UnauthorizedException("You are not the creator of this campaign");
        }

        BigDecimal availableBalance = campaign.getTotalCollected().subtract(campaign.getTotalWithdrawn());

        if (availableBalance.compareTo(BigDecimal.ZERO) > 0) {
            throw new BadRequestException(
                    "You must withdraw all funds before deleting the campaign. Available balance: " + availableBalance);
        }

        campaign.setStatus(Campaign.CampaignStatus.DELETED);
        campaign = campaignRepository.save(campaign);

        return mapToResponse(campaign);
    }

    private CampaignResponse mapToResponse(Campaign campaign) {
        return new CampaignResponse(
                campaign.getId(),
                campaign.getTitle(),
                campaign.getDescription(),
                campaign.getGoalAmount(),
                campaign.getImageUrl(),
                campaign.getStatus().name(),
                campaign.getTotalCollected(),
                campaign.getTotalWithdrawn(),
                campaign.getTotalCollected().subtract(campaign.getTotalWithdrawn()),
                campaign.getCreator().getEmail(),
                campaign.getCreatedAt()
        );
    }

}