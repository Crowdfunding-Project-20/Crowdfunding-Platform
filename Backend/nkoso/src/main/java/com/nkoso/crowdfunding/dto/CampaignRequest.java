package com.nkoso.crowdfunding.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CampaignRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Goal amount is required")
    @DecimalMin(value = "1.00", message = "Goal amount must be at least 1.00")
    @Digits(integer = 10, fraction = 2, message = "Goal amount must have at most 10 integer digits and 2 fraction digits")
    private BigDecimal goalAmount;

    private String imageUrl;

    public CampaignRequest() {
    }

    public CampaignRequest(String title, String description, BigDecimal goalAmount, String imageUrl) {
        this.title = title;
        this.description = description;
        this.goalAmount = goalAmount;
        this.imageUrl = imageUrl;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getGoalAmount() {
        return goalAmount;
    }

    public void setGoalAmount(BigDecimal goalAmount) {
        this.goalAmount = goalAmount;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

}