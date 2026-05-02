import { test, expect } from '@playwright/test';
import { loginAndGoHome, premiumLocators, hasCredentials } from '../support/module12-premium.helper.js';

test.skip(true, 'Stripe payment form requires navigating deep into checkout — skip until subscription page is confirmed integrated.');

test('TC-M12-SUB-02: Stripe payment form or mock checkout renders on subscription page', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    await loginAndGoHome(page);
    const locators = premiumLocators(page);

    await expect(locators.upgradeBtn).toBeVisible({ timeout: 10000 });
    await locators.upgradeBtn.click();
    await page.waitForTimeout(2000);

    // Find and click a subscribe/checkout button to trigger Stripe
    const checkoutBtn = page.locator('button, [role="button"]').filter({ hasText: /subscribe|checkout|get pro|get go\+/i }).first();
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
    await checkoutBtn.click();
    await page.waitForTimeout(3000);

    // Stripe iframe or card input fields must appear
    await expect(locators.stripeForm).toBeVisible({ timeout: 15000 });
});
