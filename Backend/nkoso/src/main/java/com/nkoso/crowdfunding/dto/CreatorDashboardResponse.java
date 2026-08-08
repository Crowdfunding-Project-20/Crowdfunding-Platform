package com.nkoso.crowdfunding.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CreatorDashboardResponse {

    private BigDecimal totalRaised;
    private BigDecimal totalWithdrawn;
    private BigDecimal availableBalance;
    private int numberOfBackers;
    private int numberOfCampaigns;
    private List<DonationSummary> recentDonations;

    public CreatorDashboardResponse() {
    }

    public CreatorDashboardResponse(BigDecimal totalRaised, BigDecimal totalWithdrawn,
                                    BigDecimal availableBalance, int numberOfBackers,
                                    int numberOfCampaigns, List<DonationSummary> recentDonations) {
        this.totalRaised = totalRaised;
        this.totalWithdrawn = totalWithdrawn;
        this.availableBalance = availableBalance;
        this.numberOfBackers = numberOfBackers;
        this.numberOfCampaigns = numberOfCampaigns;
        this.recentDonations = recentDonations;
    }

    public BigDecimal getTotalRaised() {
        return totalRaised;
    }

    public void setTotalRaised(BigDecimal totalRaised) {
        this.totalRaised = totalRaised;
    }

    public BigDecimal getTotalWithdrawn() {
        return totalWithdrawn;
    }

    public void setTotalWithdrawn(BigDecimal totalWithdrawn) {
        this.totalWithdrawn = totalWithdrawn;
    }

    public BigDecimal getAvailableBalance() {
        return availableBalance;
    }

    public void setAvailableBalance(BigDecimal availableBalance) {
        this.availableBalance = availableBalance;
    }

    public int getNumberOfBackers() {
        return numberOfBackers;
    }

    public void setNumberOfBackers(int numberOfBackers) {
        this.numberOfBackers = numberOfBackers;
    }

    public int getNumberOfCampaigns() {
        return numberOfCampaigns;
    }

    public void setNumberOfCampaigns(int numberOfCampaigns) {
        this.numberOfCampaigns = numberOfCampaigns;
    }

    public List<DonationSummary> getRecentDonations() {
        return recentDonations;
    }

    public void setRecentDonations(List<DonationSummary> recentDonations) {
        this.recentDonations = recentDonations;
    }

    public static class DonationSummary {

        private LocalDateTime date;
        private BigDecimal amount;

        public DonationSummary() {
        }

        public DonationSummary(LocalDateTime date, BigDecimal amount) {
            this.date = date;
            this.amount = amount;
        }

        public LocalDateTime getDate() {
            return date;
        }

        public void setDate(LocalDateTime date) {
            this.date = date;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

    }

}