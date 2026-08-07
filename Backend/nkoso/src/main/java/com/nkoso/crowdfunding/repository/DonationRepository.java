package com.nkoso.crowdfunding.repository;

import com.nkoso.crowdfunding.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByCampaignId(Long campaignId);

    List<Donation> findByBackerId(Long backerId);

}