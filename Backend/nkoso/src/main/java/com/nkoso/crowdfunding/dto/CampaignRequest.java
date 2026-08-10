package com.nkoso.crowdfunding.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.nkoso.crowdfunding.entity.Campaign;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Schema(description = "Campaign creation/update request payload")
public class CampaignRequest {

    @NotBlank(message = "Title is required")
    @Schema(description = "Campaign title", example = "Help build a community garden")
    private String title;

    @Schema(description = "Campaign description", example = "We're raising funds to build a community garden in the city center...")
    private String description;

    @NotNull(message = "Goal amount is required")
    @DecimalMin(value = "1.00", message = "Goal amount must be at least 1.00")
    @Digits(integer = 10, fraction = 2, message = "Goal amount must have at most 10 integer digits and 2 fraction digits")
    @Schema(description = "Funding goal amount", example = "5000.00")
    private BigDecimal goalAmount;

    @Schema(description = "URL to campaign image", example = "https://example.com/image.jpg")
    private String imageUrl;

    @NotNull(message = "Category is required")
    @Schema(description = "Campaign category", example = "EDUCATION")
    private Campaign.CampaignCategory category;

    public CampaignRequest() {
    }

    public CampaignRequest(String title, String description, BigDecimal goalAmount, String imageUrl, Campaign.CampaignCategory category) {
        this.title = title;
        this.description = description;
        this.goalAmount = goalAmount;
        this.imageUrl = imageUrl;
        this.category = category;
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

    public Campaign.CampaignCategory getCategory() {
        return category;
    }

    public void setCategory(Campaign.CampaignCategory category) {
        this.category = category;
    }

}