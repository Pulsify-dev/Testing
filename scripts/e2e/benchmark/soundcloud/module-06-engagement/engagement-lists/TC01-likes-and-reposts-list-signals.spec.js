import { test, expect } from '@playwright/test';
import {
    module6EngagementLocators,
    openSoundCloudEngagementBenchmark,
} from '../support/module6-soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 6 (Engagement) Engagement Lists', () => {
    test('SC-M6-LST-01: likes and reposts list signals are present', async ({ page }) => {
        await openSoundCloudEngagementBenchmark(page);

        const locators = module6EngagementLocators(page);
        const hasListSignals = (await locators.engagementListSignals.count()) > 0;
        const hasCountSignals = (await locators.engagementCountSignals.count()) > 0;

        expect(hasListSignals || hasCountSignals).toBeTruthy();
    });
});
