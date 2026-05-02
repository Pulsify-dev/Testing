import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, trackPageLocators, hasCredentials } from '../support/module4-tracks.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M4-WAV-01: waveform element renders on track page', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = trackPageLocators(page);

    await expect(locators.trackHero.or(locators.unavailableState).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.waveform).toBeVisible();
});
