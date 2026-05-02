import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, moderationLocators, hasCredentials } from '../support/module11-moderation.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M11-REP-02: clicking report opens a modal with reason options', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = moderationLocators(page);

    await expect(page.locator('.track-hero')).toBeVisible({ timeout: 20000 });

    // Open more-options menu if report is nested inside it
    const moreBtn = page.locator('button, [role="button"]').filter({ hasText: /more|options|\.\.\./i }).first();
    if ((await moreBtn.count()) > 0) {
        await moreBtn.click();
        await page.waitForTimeout(500);
    }

    await expect(locators.reportBtn).toBeVisible({ timeout: 10000 });
    await locators.reportBtn.click();
    await page.waitForTimeout(1000);

    // Modal must open with at least one selectable reason (copyright / inappropriate)
    await expect(locators.reportModal).toBeVisible({ timeout: 5000 });
    await expect(locators.reportReasonOptions.first()).toBeVisible({ timeout: 5000 });
});
