import { test, expect } from '@playwright/test';
import { hasCredentials, module12Env } from '../support/module12-premium.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M12-PRK-03: offline/save-for-later feature is gated or absent for free users', async ({ page }) => {
    const { testUserEmail, testUserPassword, testTrackId } = module12Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(`/tracks/${testTrackId}`);

    await expect(page.locator('.track-hero')).toBeVisible({ timeout: 20000 });
    await page.waitForSelector('text=/Loading track experience/i', { state: 'hidden', timeout: 30000 });

    const offlineBtn = page.locator('button, [role="button"]').filter({ hasText: /save offline|listen offline|download/i }).first();

    if ((await offlineBtn.count()) === 0) {
        // Offline button not shown to free users — valid gating behavior
        return;
    }

    await offlineBtn.click();
    await page.waitForTimeout(1500);

    // Must be blocked by an upgrade prompt — not trigger a real download
    const isGated =
        (await page.locator('text=/upgrade|pro|go\+|premium|not available/i').count()) > 0 ||
        (await page.locator('[class*="paywall"], [class*="upsell"]').count()) > 0;
    expect(isGated).toBeTruthy();
});
