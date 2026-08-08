package com.nkoso.crowdfunding.service;

import com.nkoso.crowdfunding.dto.AdminDashboardResponse;
import com.nkoso.crowdfunding.dto.AdminDashboardResponse.TopCampaign;
import com.nkoso.crowdfunding.dto.CreatorDashboardResponse;
import com.nkoso.crowdfunding.dto.CreatorDashboardResponse.DonationSummary;
import com.nkoso.crowdfunding.entity.Campaign;
import com.nkoso.crowdfunding.entity.Donation;
import com.nkoso.crowdfunding.entity.User;
import com.nkoso.crowdfunding.repository.CampaignRepository;
import com.nkoso.crowdfunding.repository.DonationRepository;
import com.nkoso.crowdfunding.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final CampaignRepository campaignRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;

    public AnalyticsService(CampaignRepository campaignRepository,
                            DonationRepository donationRepository,
                            UserRepository userRepository) {
        this.campaignRepository = campaignRepository;
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CreatorDashboardResponse getCreatorDashboard(Long userId) {
        List<Campaign> campaigns = campaignRepository.findByCreatorId(userId);

        int numberOfCampaigns = campaigns.size();
        BigDecimal totalRaised = campaigns.stream()
                .map(Campaign::getTotalCollected)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalWithdrawn = campaigns.stream()
                .map(Campaign::getTotalWithdrawn)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal availableBalance = totalRaised.subtract(totalWithdrawn);

        List<Long> campaignIds = campaigns.stream()
                .map(Campaign::getId)
                .toList();

        List<DonationSummary> recentDonations = List.of();
        int numberOfBackers = 0;

        if (!campaignIds.isEmpty()) {
            List<Donation> donations = donationRepository.findByCampaignIds(campaignIds);

            Set<Long> distinctBackerIds = donations.stream()
                    .map(d -> d.getBacker().getId())
                    .collect(Collectors.toSet());
            numberOfBackers = distinctBackerIds.size();

            recentDonations = donations.stream()
                    .map(d -> new DonationSummary(d.getTimestamp(), d.getAmount()))
                    .toList();
        }

        return new CreatorDashboardResponse(totalRaised, totalWithdrawn, availableBalance,
                numberOfBackers, numberOfCampaigns, recentDonations);
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        List<Campaign> allCampaigns = campaignRepository.findAll();
        List<Donation> allDonations = donationRepository.findAll();

        BigDecimal totalPlatformRaised = allCampaigns.stream()
                .map(Campaign::getTotalCollected)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalFeesCollected = allDonations.stream()
                .map(d -> d.getAmount().multiply(d.getFeePercentSnapshot()).divide(BigDecimal.valueOf(100)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalCampaigns = allCampaigns.size();
        long totalUsers = userRepository.count();

        List<TopCampaign> topCampaigns = allCampaigns.stream()
                .sorted(Comparator.comparing(Campaign::getTotalCollected).reversed())
                .limit(5)
                .map(c -> new TopCampaign(c.getId(), c.getTitle(), c.getTotalCollected()))
                .toList();

        return new AdminDashboardResponse(totalPlatformRaised, totalFeesCollected,
                totalCampaigns, totalUsers, topCampaigns);
    }

}