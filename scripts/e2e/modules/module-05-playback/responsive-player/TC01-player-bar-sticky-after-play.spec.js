import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, playerLocators, hasCredentials } from '../support/module5-playback.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-RSP-01: player bar persists after navigating away from track page', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = playerLocators(page);

    await expect(page.locator('.track-hero, .app-shell').first()).toBeVisible({ timeout: 15000 });
    if ((await page.locator('.track-hero').count()) > 0) {
        await locators.playButton.click();
        await page.waitForTimeout(3000);
    }

    // Navigate via Home nav link instead of direct URL to preserve player state
    await page.click('nav a:has-text("Home"), a[href="/discover"]');
    await page.waitForTimeout(500);

    await expect(locators.playerBar).toBeVisible({ timeout: 10000 });
});
