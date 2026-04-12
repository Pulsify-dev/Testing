import { test, expect } from '@playwright/test';
import {
    module4TrackLocators,
    openSoundCloudTrackBenchmark,
} from '../support/module4-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 4 (Tracks) Visibility', () => {
    test('SC-M4-VIS-01: public track page is accessible and renders core surface', async ({ page }) => {
        await openSoundCloudTrackBenchmark(page);

        const locators = module4TrackLocators(page);
        await expect(page).toHaveURL(/soundcloud\.com/i);
        await expect(locators.title).toBeVisible({ timeout: 20000 });

        const hasUnavailableSignal = (await locators.unavailableSignals.count()) > 0;
        expect(hasUnavailableSignal).toBeFalsy();
    });
});
