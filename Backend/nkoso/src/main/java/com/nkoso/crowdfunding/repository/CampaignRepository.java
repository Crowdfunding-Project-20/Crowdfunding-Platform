package com.nkoso.crowdfunding.repository;

import com.nkoso.crowdfunding.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByCreatorId(Long creatorId);

    List<Campaign> findByStatus(Campaign.CampaignStatus status);

    List<Campaign> findTop5ByOrderByTotalCollectedDesc();

}