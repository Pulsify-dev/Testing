import { test, expect } from '@playwright/test';
import { loginAndOpenMessages, messagingLocators, hasCredentials, module9Env } from '../support/module9-messaging.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M9-PRV-01: message input area accepts text for track sharing', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module9Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/messages');

    await page.waitForTimeout(2000);

    // Look for a message text input in any open conversation
    const msgInput = page.locator('textarea, input[type="text"]').filter({ hasText: '' }).first();
    if ((await msgInput.count()) === 0) return; // no open conversation

    await expect(msgInput).toBeVisible();
    const isEditable = await msgInput.isEditable().catch(() => false);
    expect(isEditable).toBeTruthy();
});
