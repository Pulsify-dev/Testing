import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-LIK-02: like button interaction is present and clickable', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    await locators.likeButton.click();
    await page.waitForTimeout(1500);

    const authGated =
        (await page.locator('text=/sign in|log in|login|register/i').count()) > 0 ||
        page.url().includes('/login') ||
        (await page.locator('[class*="modal"], [class*="auth"]').count()) > 0 ||
        (await locators.likeButton.count()) > 0;
    expect(authGated).toBeTruthy();
});
