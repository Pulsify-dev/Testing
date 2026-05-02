import { test, expect } from '@playwright/test';
import { loginAsAdmin, moderationLocators, hasAdminCredentials } from '../support/module11-moderation.helper.js';

test.skip(true, 'Module 11 analytics dashboard is not yet integrated.');

test('TC-M11-HLT-01: platform health dashboard renders key metrics', async ({ page }) => {
    test.skip(!hasAdminCredentials(), 'Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD first.');
    await loginAsAdmin(page);
    await page.goto('/admin/analytics');
    await expect(page).toHaveURL(/\/admin/);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    const locators = moderationLocators(page);
    await expect(locators.analyticsPanel).toBeVisible({ timeout: 15000 });

    // Must show at least one of the three core platform metrics
    const hasActiveUsers = (await page.locator('text=/active user/i').count()) > 0;
    const hasPlayRate = (await page.locator('text=/play.*(rate|through)|stream/i').count()) > 0;
    const hasStorage = (await page.locator('text=/storage/i').count()) > 0;
    expect(hasActiveUsers || hasPlayRate || hasStorage).toBeTruthy();
});
