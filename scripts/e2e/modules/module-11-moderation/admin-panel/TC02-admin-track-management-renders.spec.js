import { test, expect } from '@playwright/test';
import { loginAsAdmin, hasAdminCredentials } from '../support/module11-moderation.helper.js';

test.skip(!hasAdminCredentials(), 'Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD first.');

test('TC-M11-ADM-02: admin panel renders navigation sections and track management', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    // Sidebar navigation items visible in the admin dashboard
    await expect(page.locator('text=/Dashboard/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Tracks Management/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Content Moderation/i').first()).toBeVisible({ timeout: 10000 });
});
