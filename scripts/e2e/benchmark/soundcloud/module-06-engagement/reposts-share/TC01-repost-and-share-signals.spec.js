import { test, expect } from '@playwright/test';
import {
    module6EngagementLocators,
    openSoundCloudEngagementBenchmark,
} from '../support/module6-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 6 (Engagement) Reposts and Share', () => {
    test('SC-M6-REP-01: repost and share action signals are discoverable', async ({ page }) => {
        await openSoundCloudEngagementBenchmark(page);

        const locators = module6EngagementLocators(page);
        const hasRepostSignals = (await locators.repostActions.count()) > 0;
        const hasShareSignals = (await locators.shareActions.count()) > 0;

        expect(hasRepostSignals || hasShareSignals).toBeTruthy();
    });
});
