import { test, expect } from '@playwright/test';
import {
    module5PlaybackLocators,
    openSoundCloudPlaybackBenchmark,
} from '../support/module5-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 5 (Playback) Streaming Controls', () => {
    test('SC-M5-CTRL-01: core playback controls expose play, seek, and volume signals', async ({ page }) => {
        await openSoundCloudPlaybackBenchmark(page);

        const locators = module5PlaybackLocators(page);
        await expect(locators.playButton).toBeVisible({ timeout: 20000 });

        const hasSeekSignal = (await locators.seekSignals.count()) > 0;
        const hasVolumeSignal = (await locators.volumeSignals.count()) > 0;

        expect(hasSeekSignal).toBeTruthy();
        expect(hasVolumeSignal).toBeTruthy();
    });
});
