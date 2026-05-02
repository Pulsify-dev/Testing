import { test, expect } from '@playwright/test';
import { loginAsAdmin, moderationLocators, hasAdminCredentials } from '../support/module11-moderation.helper.js';

test.skip(true, 'Module 11 admin panel is not yet integrated — requires separate admin credentials and route.');

test('TC-M11-ADM-02: admin panel renders track content management list', async ({ page }) => {
    test.skip(!hasAdminCredentials(), 'Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD first.');
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    const locators = moderationLocators(page);
    await expect(locators.adminPanel).toBeVisible({ timeout: 15000 });

    // Track/content management table must be present
    await expect(locators.trackListTable).toBeVisible({ timeout: 10000 });
});
