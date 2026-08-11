package com.nkoso.crowdfunding.config;

import com.nkoso.crowdfunding.entity.PlatformSettings;
import com.nkoso.crowdfunding.repository.PlatformSettingsRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;

/**
 * Seeds the single platform-settings row (id = 1) that the donation flow depends on.
 *
 * {@code DonationService} reads the fee percent from this row and fails with
 * "Platform settings not configured" when it's absent, so it's created here at
 * startup if missing — mirrors {@link UserDataInitializer}'s self-healing pattern.
 */
@Component
public class PlatformSettingsInitializer {

    private static final long PLATFORM_SETTINGS_ID = 1L;
    private static final BigDecimal FEE_PERCENT = new BigDecimal("5.00");

    private final PlatformSettingsRepository platformSettingsRepository;

    public PlatformSettingsInitializer(PlatformSettingsRepository platformSettingsRepository) {
        this.platformSettingsRepository = platformSettingsRepository;
    }

    @PostConstruct
    @Transactional
    public void seedIfMissing() {
        if (platformSettingsRepository.findById(PLATFORM_SETTINGS_ID).isEmpty()) {
            PlatformSettings settings = new PlatformSettings(FEE_PERCENT);
            settings.setId(PLATFORM_SETTINGS_ID);
            platformSettingsRepository.save(settings);
        }
    }
}
