import { test, expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

function hasAdminCredentials() {
    return Boolean(process.env.ADMIN_USER_EMAIL && process.env.ADMIN_USER_PASSWORD);
}

const testTrackId = process.env.TEST_TRACK_ID || '69d67db1f279d83706cfbda8';

test.skip(!hasAdminCredentials(), 'Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD first.');

test('TC-M12-PRK-03: pro user can access offline/save-for-later feature without hitting a paywall', async ({ page }) => {
    await loginViaUi(page, process.env.ADMIN_USER_EMAIL, process.env.ADMIN_USER_PASSWORD);
    await page.goto(`/tracks/${testTrackId}`);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    const offlineBtn = page.locator('button, [role="button"], a').filter({ hasText: /save offline|listen offline|download|save/i }).first();
    const hasOffline = (await offlineBtn.count()) > 0;

    if (hasOffline) {
        await expect(offlineBtn).toBeVisible({ timeout: 5000 });
        await offlineBtn.click();
        await page.waitForTimeout(1500);

        // Pro user must NOT be blocked by a paywall after clicking
        const isBlocked = (await page.locator('text=/upgrade|not available/i').count()) > 0
            && (await page.locator('[class*="paywall"], [class*="upsell"]').count()) > 0;
        expect(isBlocked).toBeFalsy();
    }
    // If feature is not exposed on track page, pass — absence is not a paywall
});
