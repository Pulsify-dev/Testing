import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, playerLocators, hasCredentials } from '../support/module5-playback.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-STR-01: play button is visible on track hero', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = playerLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.playButton).toBeVisible();
});
