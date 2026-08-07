package com.nkoso.crowdfunding.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "platform_settings")
public class PlatformSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal feePercent;

    public PlatformSettings() {}

    public PlatformSettings(BigDecimal feePercent) {
        this.feePercent = feePercent;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getFeePercent() { return feePercent; }
    public void setFeePercent(BigDecimal feePercent) { this.feePercent = feePercent; }

}