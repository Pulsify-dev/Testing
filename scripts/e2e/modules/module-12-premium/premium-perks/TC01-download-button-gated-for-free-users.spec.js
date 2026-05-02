import { test, expect } from '@playwright/test';
import { hasCredentials, module12Env } from '../support/module12-premium.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M12-PRK-01: download/offline button is gated for free-tier users', async ({ page }) => {
    const { testUserEmail, testUserPassword, testTrackId } = module12Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(`/tracks/${testTrackId}`);

    await expect(page.locator('.track-hero')).toBeVisible({ timeout: 20000 });
    await page.waitForSelector('text=/Loading track experience/i', { state: 'hidden', timeout: 30000 });

    const downloadBtn = page.locator('button, [role="button"]').filter({ hasText: /download|offline/i }).first();

    if ((await downloadBtn.count()) === 0) {
        // Download button not shown to free users at all — that is valid gating
        return;
    }

    await downloadBtn.click();
    await page.waitForTimeout(1500);

    // Clicking must trigger an upgrade prompt — not silently download
    const hasUpgradePrompt =
        (await page.locator('text=/upgrade|pro|go\+|premium/i').count()) > 0 ||
        (await page.locator('[class*="paywall"], [class*="upsell"], [class*="gate"]').count()) > 0;
    expect(hasUpgradePrompt).toBeTruthy();
});
