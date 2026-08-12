package com.nkoso.crowdfunding.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DonationResponse {

    private Long id;
    private Long campaignId;
    private BigDecimal amount;
    private BigDecimal feePercentSnapshot;
    private LocalDateTime createdAt;
    private String backerUsername;
    private boolean anonymous;

    public DonationResponse() {
    }

    public DonationResponse(Long id, Long campaignId, BigDecimal amount,
                            BigDecimal feePercentSnapshot, LocalDateTime createdAt,
                            String backerUsername, boolean anonymous) {
        this.id = id;
        this.campaignId = campaignId;
        this.amount = amount;
        this.feePercentSnapshot = feePercentSnapshot;
        this.createdAt = createdAt;
        this.backerUsername = backerUsername;
        this.anonymous = anonymous;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(Long campaignId) {
        this.campaignId = campaignId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getFeePercentSnapshot() {
        return feePercentSnapshot;
    }

    public void setFeePercentSnapshot(BigDecimal feePercentSnapshot) {
        this.feePercentSnapshot = feePercentSnapshot;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getBackerUsername() {
        return backerUsername;
    }

    public void setBackerUsername(String backerUsername) {
        this.backerUsername = backerUsername;
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }

}