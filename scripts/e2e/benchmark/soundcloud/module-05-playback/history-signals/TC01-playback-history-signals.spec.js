import { test, expect } from '@playwright/test';
import {
    module5PlaybackLocators,
    openSoundCloudPlaybackBenchmark,
    tryStartPlayback,
} from '../support/module5-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 5 (Playback) History Signals', () => {
    test('SC-M5-HIST-01: timeline/history-like playback signals are present after play attempt', async ({ page }) => {
        await openSoundCloudPlaybackBenchmark(page);
        const state = await tryStartPlayback(page);

        const locators = module5PlaybackLocators(page);
        const hasTimeSignals = (await locators.timeSignals.count()) > 0;
        const hasAuthGate = (await locators.authGateSignals.count()) > 0;

        expect(hasTimeSignals || hasAuthGate).toBeTruthy();
        expect(['playing', 'auth-gate']).toContain(state);
    });
});
