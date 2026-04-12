import { test, expect } from '@playwright/test';
import {
    dismissSoundCloudModals,
    module4TrackLocators,
    openSoundCloudTrackBenchmark,
} from '../support/module4-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 4 (Tracks) Stream Readiness', () => {
    test('SC-M4-PLAY-02: pressing play yields pause signal or auth-gate signal', async ({ page }) => {
        await openSoundCloudTrackBenchmark(page);

        const locators = module4TrackLocators(page);
        await expect(locators.playButton).toBeVisible({ timeout: 20000 });

        try {
            await locators.playButton.click({ timeout: 5000 });
        } catch {
            await dismissSoundCloudModals(page);
            await locators.playButton.click({ force: true, timeout: 5000 });
        }

        await page.waitForTimeout(1200);
        const hasPauseSignal = (await locators.pauseSignals.count()) > 0;
        const hasAuthGateSignal = (await locators.authGateSignals.count()) > 0;

        expect(hasPauseSignal || hasAuthGateSignal).toBeTruthy();
    });
});
