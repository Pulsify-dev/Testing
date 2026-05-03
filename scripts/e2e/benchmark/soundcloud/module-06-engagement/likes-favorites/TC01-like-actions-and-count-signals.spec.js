import { test, expect } from '@playwright/test';
import {
    module6EngagementLocators,
    openSoundCloudEngagementBenchmark,
} from '../support/module6-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 6 (Engagement) Likes and Favorites', () => {
    test('SC-M6-LIKE-01: like actions and favorites-like count signals are visible', async ({ page }) => {
        await openSoundCloudEngagementBenchmark(page);

        const locators = module6EngagementLocators(page);
        await expect(locators.likeActions.first()).toBeVisible({ timeout: 20000 });

        const hasCountSignals = (await locators.engagementCountSignals.count()) > 0;
        expect(hasCountSignals).toBeTruthy();
    });
});
