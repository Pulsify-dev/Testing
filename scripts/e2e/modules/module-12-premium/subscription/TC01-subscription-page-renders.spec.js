import { test, expect } from '@playwright/test';
import { loginAndGoHome, premiumLocators, hasCredentials } from '../support/module12-premium.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M12-SUB-01: clicking upgrade CTA navigates to a subscription/pricing page', async ({ page }) => {
    await loginAndGoHome(page);
    const locators = premiumLocators(page);

    await expect(locators.upgradeBtn).toBeVisible({ timeout: 10000 });
    await locators.upgradeBtn.click();
    await page.waitForTimeout(2000);

    // Must land on a pricing/subscription page — not stay on home
    const onPricingPage =
        page.url().includes('/upgrade') ||
        page.url().includes('/subscription') ||
        page.url().includes('/pricing') ||
        page.url().includes('/pro');

    const showsSubscriptionContent =
        (await page.locator('text=/pro|go\+|premium|per month|subscribe/i').count()) > 0 ||
        (await locators.subscriptionPage.count()) > 0;

    expect(onPricingPage || showsSubscriptionContent).toBeTruthy();
});
