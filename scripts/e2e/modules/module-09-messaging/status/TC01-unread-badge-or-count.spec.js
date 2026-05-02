import { test, expect } from '@playwright/test';
import { hasCredentials, module9Env } from '../support/module9-messaging.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M9-STA-01: messages nav item renders unread badge or no badge (both valid)', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module9Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/home');

    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 15000 });

    // Unread count badge is optional — the test just verifies the nav renders
    const navMsgs = page.locator('[href="/messages"], a').filter({ hasText: /message/i }).first();
    const hasNav = (await navMsgs.count()) > 0;
    const hasIcon = (await page.locator('[class*="message"], [class*="inbox"]').count()) > 0;
    expect(hasNav || hasIcon).toBeTruthy();
});
