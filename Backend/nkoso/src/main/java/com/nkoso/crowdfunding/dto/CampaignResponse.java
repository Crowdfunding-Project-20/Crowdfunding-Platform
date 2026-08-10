package com.nkoso.crowdfunding.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CampaignResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal goalAmount;
    private String imageUrl;
    private String category;
    private String status;
    private BigDecimal totalCollected;
    private BigDecimal totalWithdrawn;
    private BigDecimal availableBalance;
    private String creatorEmail;
    private LocalDateTime createdAt;

    public CampaignResponse() {
    }

    public CampaignResponse(Long id, String title, String description, BigDecimal goalAmount,
                            String imageUrl, String category, String status, BigDecimal totalCollected,
                            BigDecimal totalWithdrawn, BigDecimal availableBalance,
                            String creatorEmail, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.goalAmount = goalAmount;
        this.imageUrl = imageUrl;
        this.category = category;
        this.status = status;
        this.totalCollected = totalCollected;
        this.totalWithdrawn = totalWithdrawn;
        this.availableBalance = availableBalance;
        this.creatorEmail = creatorEmail;
        this.createdAt = createdAt;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalCollected() {
        return totalCollected;
    }

    public void setTotalCollected(BigDecimal totalCollected) {
        this.totalCollected = totalCollected;
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

    public String getCreatorEmail() {
        return creatorEmail;
    }

    public void setCreatorEmail(String creatorEmail) {
        this.creatorEmail = creatorEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}