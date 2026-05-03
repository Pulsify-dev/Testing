import { test, expect } from '@playwright/test';
import {
    openSoundCloudPlaybackBenchmark,
    tryStartPlayback,
} from '../support/module5-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 5 (Playback) Streaming Controls', () => {
    test('SC-M5-CTRL-02: play action yields playable or auth-gated state', async ({ page }) => {
        await openSoundCloudPlaybackBenchmark(page);
        const state = await tryStartPlayback(page);
        expect(['playing', 'auth-gate']).toContain(state);
    });
});
