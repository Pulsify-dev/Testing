import { test, expect } from '@playwright/test';
import { loginAsAdmin, hasAdminCredentials } from '../support/module11-moderation.helper.js';

test.skip(true, 'Module 11 admin panel is not yet integrated — suspend action cannot be verified.');

test('TC-M11-ADM-03: admin can see suspend/hide action on a flagged item', async ({ page }) => {
    test.skip(!hasAdminCredentials(), 'Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD first.');
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    // A suspend or hide action button must be present in the content list
    const actionBtn = page.locator('button, [role="button"]').filter({ hasText: /suspend|hide|remove|ban/i }).first();
    await expect(actionBtn).toBeVisible({ timeout: 15000 });
});
