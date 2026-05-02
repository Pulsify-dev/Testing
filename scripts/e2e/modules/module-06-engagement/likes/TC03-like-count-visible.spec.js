import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, engagementLocators, hasCredentials } from '../support/module6-engagement.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M6-LIK-03: like count or stat row is visible on track page', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = engagementLocators(page);

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });
    await expect(locators.trackHero).toBeVisible({ timeout: 20000 });

    // Wait for loading state to disappear
    await page.waitForSelector('text=/Loading track experience/i', { state: 'hidden', timeout: 30000 });

    await expect(locators.statRow).toBeVisible({ timeout: 15000 });
});
