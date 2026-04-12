import { test, expect } from '@playwright/test';
import {
    module4TrackLocators,
    openSoundCloudTrackBenchmark,
} from '../support/module4-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 4 (Tracks) Metadata', () => {
    test('SC-M4-META-01: title, creator, and metadata signals are visible', async ({ page }) => {
        await openSoundCloudTrackBenchmark(page);

        const locators = module4TrackLocators(page);

        await expect(locators.title).toBeVisible({ timeout: 20000 });
        expect(await locators.creatorSignals.count()).toBeGreaterThan(0);
        expect(await locators.metadataSignals.count()).toBeGreaterThan(0);
    });
});
