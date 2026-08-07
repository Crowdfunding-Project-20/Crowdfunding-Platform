package com.nkoso.crowdfunding.repository;

import com.nkoso.crowdfunding.entity.PlatformSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, Long> {

}