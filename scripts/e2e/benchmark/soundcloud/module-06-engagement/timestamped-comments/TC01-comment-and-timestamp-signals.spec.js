import { test, expect } from '@playwright/test';
import {
    module6EngagementLocators,
    openSoundCloudEngagementBenchmark,
} from '../support/module6-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 6 (Engagement) Timestamped Comments', () => {
    test('SC-M6-CMT-01: comment and timestamp signals are visible on track surface', async ({ page }) => {
        await openSoundCloudEngagementBenchmark(page);

        const locators = module6EngagementLocators(page);
        const hasCommentSignals = (await locators.commentSignals.count()) > 0;
        const hasTimestampSignals = (await locators.timestampSignals.count()) > 0;

        expect(hasCommentSignals).toBeTruthy();
        expect(hasTimestampSignals).toBeTruthy();
    });
});
