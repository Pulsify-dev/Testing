import { test, expect } from '@playwright/test';
import { hasCredentials, module10Env } from '../support/module10-notifications.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M10-STA-03: notification bell/icon is visible in global nav after login', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module10Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/home');
    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });
    const notifNav = page.locator('[href="/notifications"], [class*="notif"], [aria-label*="notif"], [aria-label*="bell"]');
    await expect(notifNav.first()).toBeVisible({ timeout: 10000 });
});
