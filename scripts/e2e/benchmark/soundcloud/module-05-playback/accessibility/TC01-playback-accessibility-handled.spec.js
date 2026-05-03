import { test, expect } from '@playwright/test';
import {
    module5PlaybackLocators,
    openSoundCloudPlaybackBenchmark,
    tryStartPlayback,
} from '../support/module5-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 5 (Playback) Accessibility', () => {
    test('SC-M5-ACC-01: playback accessibility resolves to playing or auth-gate signals', async ({ page }) => {
        await openSoundCloudPlaybackBenchmark(page);
        const state = await tryStartPlayback(page);

        const locators = module5PlaybackLocators(page);

        if (state === 'playing') {
            expect((await locators.pauseSignals.count()) > 0).toBeTruthy();
            return;
        }

        expect((await locators.authGateSignals.count()) > 0).toBeTruthy();
    });
});
