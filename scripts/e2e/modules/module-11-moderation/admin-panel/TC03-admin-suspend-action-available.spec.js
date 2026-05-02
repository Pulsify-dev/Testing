import { test, expect } from '@playwright/test';
import { loginAsAdmin, hasAdminCredentials } from '../support/module11-moderation.helper.js';

test.skip(!hasAdminCredentials(), 'Set ADMIN_USER_EMAIL and ADMIN_USER_PASSWORD first.');

test('TC-M11-ADM-03: admin content moderation section is reachable from sidebar', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    // Click Content Moderation in the sidebar
    const contentModerationLink = page.locator('text=/Content Moderation/i').first();
    await expect(contentModerationLink).toBeVisible({ timeout: 10000 });
    await contentModerationLink.click();
    await page.waitForTimeout(1500);

    // Should show a list or table of reported/flagged content
    const hasTable = (await page.locator('table').count()) > 0;
    const hasContentList = (await page.locator('[class*="moderat"], [class*="report"], [class*="content-list"]').count()) > 0;
    const hasPendingReports = (await page.locator('text=/pending report|flagged|reported/i').count()) > 0;
    expect(hasTable || hasContentList || hasPendingReports).toBeTruthy();
});
