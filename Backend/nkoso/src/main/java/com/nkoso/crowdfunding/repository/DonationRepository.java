package com.nkoso.crowdfunding.repository;

import com.nkoso.crowdfunding.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByCampaignId(Long campaignId);

    List<Donation> findByBackerId(Long backerId);

    @Query("SELECT d FROM Donation d WHERE d.campaign.id IN :campaignIds ORDER BY d.timestamp DESC")
    List<Donation> findByCampaignIds(@Param("campaignIds") List<Long> campaignIds);

    @Query("SELECT COALESCE(SUM(d.amount * d.feePercentSnapshot / 100), 0) FROM Donation d")
    BigDecimal sumTotalFees();

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Donation d")
    BigDecimal sumAllDonationAmounts();

}