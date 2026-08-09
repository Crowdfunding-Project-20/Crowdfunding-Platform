package com.nkoso.crowdfunding.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Schema(description = "Donation request payload")
public class DonationRequest {

    @NotNull(message = "Campaign ID is required")
    @Schema(description = "ID of the campaign to fund", example = "1")
    private Long campaignId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be at least 1.00")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 integer digits and 2 fraction digits")
    @Schema(description = "Donation amount", example = "50.00")
    private BigDecimal amount;

    public DonationRequest() {
    }

    public DonationRequest(Long campaignId, BigDecimal amount) {
        this.campaignId = campaignId;
        this.amount = amount;
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

}