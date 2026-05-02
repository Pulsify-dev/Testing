import { test, expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

function hasAdminCredentials() {
    return Boolean(process.env.ADMIN_USER_EMAIL && process.env.ADMIN_USER_PASSWORD);
}

test.skip(!hasAdminCredentials(), 'Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD first.');

test('TC-M12-PAY-02: free user who reached upload limit sees paywall on the upload page', async ({ page }) => {
    // Use admin account — it is a free-tier user that has hit the 10-track limit
    await loginViaUi(page, process.env.ADMIN_USER_EMAIL, process.env.ADMIN_USER_PASSWORD);
    await page.goto('/upload');
    await page.waitForTimeout(2000);

    // "Upload Limit Reached" card must appear — exact text from the app
    await expect(page.locator('text=/Upload Limit Reached/i').first()).toBeVisible({ timeout: 10000 });

    // Must offer an upgrade path
    await expect(page.locator('text=/Upgrade to Artist Pro/i').first()).toBeVisible({ timeout: 5000 });
});
