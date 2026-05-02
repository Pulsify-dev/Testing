import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, moderationLocators, hasCredentials } from '../support/module11-moderation.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M11-REP-01: report button or flag option is visible on a track page', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = moderationLocators(page);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.track-hero')).toBeVisible({ timeout: 20000 });

    // Report may be in a "more options" / "..." menu — open it if present
    const moreBtn = page.locator('button, [role="button"]').filter({ hasText: /more|options|\.\.\./i }).first();
    if ((await moreBtn.count()) > 0) {
        await moreBtn.click();
        await page.waitForTimeout(500);
    }

    await expect(locators.reportBtn).toBeVisible({ timeout: 10000 });
});
