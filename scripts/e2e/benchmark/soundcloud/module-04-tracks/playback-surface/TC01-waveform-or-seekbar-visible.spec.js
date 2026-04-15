import { test, expect } from '@playwright/test';
import {
    module4TrackLocators,
    openSoundCloudTrackBenchmark,
} from '../support/module4-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 4 (Tracks) Playback Surface', () => {
    test('SC-M4-PLAY-01: waveform or seekbar surface is rendered for the track', async ({ page }) => {
        await openSoundCloudTrackBenchmark(page);

        const locators = module4TrackLocators(page);
        await expect(locators.playButton).toBeVisible({ timeout: 20000 });
        expect(await locators.waveformSignals.count()).toBeGreaterThan(0);
    });
});
