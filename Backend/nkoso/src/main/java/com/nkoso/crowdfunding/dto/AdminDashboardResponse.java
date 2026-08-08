package com.nkoso.crowdfunding.dto;

import java.math.BigDecimal;
import java.util.List;

public class AdminDashboardResponse {

    private BigDecimal totalPlatformRaised;
    private BigDecimal totalFeesCollected;
    private long totalCampaigns;
    private long totalUsers;
    private List<TopCampaign> topCampaigns;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(BigDecimal totalPlatformRaised, BigDecimal totalFeesCollected,
                                  long totalCampaigns, long totalUsers,
                                  List<TopCampaign> topCampaigns) {
        this.totalPlatformRaised = totalPlatformRaised;
        this.totalFeesCollected = totalFeesCollected;
        this.totalCampaigns = totalCampaigns;
        this.totalUsers = totalUsers;
        this.topCampaigns = topCampaigns;
    }

    public BigDecimal getTotalPlatformRaised() {
        return totalPlatformRaised;
    }

    public void setTotalPlatformRaised(BigDecimal totalPlatformRaised) {
        this.totalPlatformRaised = totalPlatformRaised;
    }

    public BigDecimal getTotalFeesCollected() {
        return totalFeesCollected;
    }

    public void setTotalFeesCollected(BigDecimal totalFeesCollected) {
        this.totalFeesCollected = totalFeesCollected;
    }

    public long getTotalCampaigns() {
        return totalCampaigns;
    }

    public void setTotalCampaigns(long totalCampaigns) {
        this.totalCampaigns = totalCampaigns;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public List<TopCampaign> getTopCampaigns() {
        return topCampaigns;
    }

    public void setTopCampaigns(List<TopCampaign> topCampaigns) {
        this.topCampaigns = topCampaigns;
    }

    public static class TopCampaign {

        private Long id;
        private String title;
        private BigDecimal totalCollected;

        public TopCampaign() {
        }

        public TopCampaign(Long id, String title, BigDecimal totalCollected) {
            this.id = id;
            this.title = title;
            this.totalCollected = totalCollected;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public BigDecimal getTotalCollected() {
            return totalCollected;
        }

        public void setTotalCollected(BigDecimal totalCollected) {
            this.totalCollected = totalCollected;
        }

    }

}