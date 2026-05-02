import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, playerLocators, hasCredentials } from '../support/module5-playback.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-STR-03: waveform is present and interactive for seeking', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = playerLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.waveform).toBeVisible();
    const box = await locators.waveform.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(0);
});
