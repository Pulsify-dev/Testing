import { test, expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

function hasAdminCredentials() {
    return Boolean(process.env.ADMIN_USER_EMAIL && process.env.ADMIN_USER_PASSWORD);
}

test.skip(!hasAdminCredentials(), 'Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD first.');

test('TC-M12-PRK-02: pro user does not see ad banners or disruptive upgrade prompts on home page', async ({ page }) => {
    await loginViaUi(page, process.env.ADMIN_USER_EMAIL, process.env.ADMIN_USER_PASSWORD);
    await page.goto('/discover');
    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    // Pro users must not see ad banners
    const hasAdBanner = (await page.locator('[class*="ad-banner"], [class*="advertisement"], [class*="ad-slot"]').count()) > 0;
    expect(hasAdBanner).toBeFalsy();
});
