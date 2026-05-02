import { test, expect } from '@playwright/test';
import { loginAndOpenUpload, premiumLocators, hasCredentials } from '../support/module12-premium.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M12-PAY-02: free user sees upload limit messaging on the upload page', async ({ page }) => {
    await loginAndOpenUpload(page);
    const locators = premiumLocators(page);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    // Upload limit indicator or a paywall gate must be present — either is acceptable
    const hasLimitMsg = (await locators.uploadLimitMsg.count()) > 0;
    const hasPaywall = (await locators.paywallGate.count()) > 0;
    const hasUpgradePrompt = (await locators.upgradeBtn.count()) > 0;

    expect(hasLimitMsg || hasPaywall || hasUpgradePrompt).toBeTruthy();
});
