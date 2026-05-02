import { test, expect } from '@playwright/test';
import { loginAndGoHome, hasCredentials } from '../support/module12-premium.helper.js';

test.skip(true, 'Ad-free verification requires a Pro-tier test account — skip until a Pro test user is provisioned.');

test('TC-M12-PRK-02: pro user does not see ad banners or upgrade prompts on home page', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    await loginAndGoHome(page);

    // Pro users must not see upgrade CTAs or ad banners
    const hasUpgradeCta = (await page.locator('text=/upgrade now/i').count()) > 0;
    const hasAdBanner = (await page.locator('[class*="ad-banner"], [class*="advertisement"]').count()) > 0;

    expect(hasUpgradeCta).toBeFalsy();
    expect(hasAdBanner).toBeFalsy();
});
