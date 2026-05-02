import { test, expect } from '@playwright/test';
import { loginAndGoHome, premiumLocators, hasCredentials } from '../support/module12-premium.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M12-SUB-03: subscription page lists at least Free and Pro plan options', async ({ page }) => {
    await loginAndGoHome(page);
    const locators = premiumLocators(page);

    await expect(locators.upgradeBtn).toBeVisible({ timeout: 10000 });
    await locators.upgradeBtn.click();
    await page.waitForTimeout(2000);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    // Both Free tier and Pro/Go+ tier must be mentioned
    const hasFree = (await page.locator('text=/free/i').count()) > 0;
    const hasPro = (await page.locator('text=/pro|go\+|premium/i').count()) > 0;
    expect(hasFree && hasPro).toBeTruthy();
});
