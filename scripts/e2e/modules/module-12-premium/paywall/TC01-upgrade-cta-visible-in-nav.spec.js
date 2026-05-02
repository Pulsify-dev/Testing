import { test, expect } from '@playwright/test';
import { loginAndGoHome, premiumLocators, hasCredentials } from '../support/module12-premium.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M12-PAY-01: upgrade/pro CTA is visible in global nav for non-premium users', async ({ page }) => {
    await loginAndGoHome(page);
    const locators = premiumLocators(page);

    // "Upgrade now" or "Artist Pro" button is visible in the nav — confirmed in app screenshots
    await expect(locators.upgradeBtn).toBeVisible({ timeout: 10000 });
});
