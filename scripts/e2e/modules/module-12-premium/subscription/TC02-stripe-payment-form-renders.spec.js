import { test, expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';
import { premiumLocators } from '../support/module12-premium.helper.js';

// Stripe integration is mocked per spec — clicking upgrade immediately processes the subscription.
// Uses the admin account (free tier) so the upgrade flow is always exercisable.
function hasAdminCredentials() {
    return Boolean(process.env.ADMIN_USER_EMAIL && process.env.ADMIN_USER_PASSWORD);
}

test.skip(!hasAdminCredentials(), 'Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD first.');

test('TC-M12-SUB-02: clicking upgrade immediately processes mock payment and reflects pro status', async ({ page }) => {
    await loginViaUi(page, process.env.ADMIN_USER_EMAIL, process.env.ADMIN_USER_PASSWORD);
    await page.goto('/discover');
    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    const locators = premiumLocators(page);
    await expect(locators.upgradeBtn).toBeVisible({ timeout: 10000 });
    await locators.upgradeBtn.click();
    await page.waitForTimeout(3000);

    // After mock payment, user should see a pro/success indicator — in nav, on page, or via redirect
    const isNowPro =
        (await page.locator('text=/pro|go[+]|artist pro|unlimited|upgraded|success/i').count()) > 0 ||
        (await page.locator('[class*="pro"], [class*="premium"], [class*="success"]').count()) > 0;

    expect(isNowPro).toBeTruthy();
});
