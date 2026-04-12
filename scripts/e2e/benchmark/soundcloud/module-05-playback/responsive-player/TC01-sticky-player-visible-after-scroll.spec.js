import { test, expect } from '@playwright/test';
import {
    module5PlaybackLocators,
    openSoundCloudPlaybackBenchmark,
    tryStartPlayback,
} from '../support/module5-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 5 (Playback) Responsive Player', () => {
    test('SC-M5-RESP-01: player controls stay discoverable after scroll', async ({ page }) => {
        await openSoundCloudPlaybackBenchmark(page);
        await tryStartPlayback(page);

        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });

        const locators = module5PlaybackLocators(page);
        const hasStickySignal = (await locators.stickyPlayerSignals.count()) > 0;
        const hasCoreControl =
            (await locators.playButton.count()) > 0 || (await locators.pauseSignals.count()) > 0;

        expect(hasStickySignal || hasCoreControl).toBeTruthy();
    });
});
