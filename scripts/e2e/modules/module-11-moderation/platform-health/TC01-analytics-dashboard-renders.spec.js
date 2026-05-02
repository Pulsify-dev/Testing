import { test, expect } from '@playwright/test';
import { loginAsAdmin, hasAdminCredentials } from '../support/module11-moderation.helper.js';

test.skip(!hasAdminCredentials(), 'Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD first.');

test('TC-M11-HLT-01: platform health dashboard renders key metrics', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    // Platform Health section heading
    await expect(page.locator('text=/Platform Health/i').first()).toBeVisible({ timeout: 10000 });

    // Core metrics cards must all be present
    await expect(page.locator('text=/Active Users/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Play.*(Rate|Through)|Play-Through Rate/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Pending Reports/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Suspended Accounts/i').first()).toBeVisible({ timeout: 10000 });
});
