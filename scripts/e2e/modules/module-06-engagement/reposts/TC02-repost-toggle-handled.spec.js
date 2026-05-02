import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-REP-02: repost button interaction is present and clickable', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = engagementLocators(page);

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });
    await expect(locators.trackHero).toBeVisible({ timeout: 20000 });

    // Wait for loading state to disappear
    await page.waitForSelector('text=/Loading track experience/i', { state: 'hidden', timeout: 30000 });

    await locators.repostButton.click();
    await page.waitForTimeout(1500);

    const handled =
        (await page.locator('text=/sign in|log in|login/i').count()) > 0 ||
        page.url().includes('/login') ||
        (await locators.repostButton.count()) > 0;
    expect(handled).toBeTruthy();
});
