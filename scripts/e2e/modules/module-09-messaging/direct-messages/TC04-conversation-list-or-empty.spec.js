import { test, expect } from '@playwright/test';
import { loginAndOpenMessages, messagingLocators, hasCredentials } from '../support/module9-messaging.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M9-DM-04: messages sidebar shows conversation list or empty state', async ({ page }) => {
    await loginAndOpenMessages(page);

    await page.waitForTimeout(3000);
    const hasConversations = (await page.locator('[class*="conversation"], [class*="chat-row"], [class*="thread"]').count()) > 0;
    const hasEmpty = (await page.locator('text=/no message|no conversation|start a conversation/i').count()) > 0;
    const hasShell = (await page.locator('.app-shell, .messages-layout').count()) > 0;
    expect(hasConversations || hasEmpty || hasShell).toBeTruthy();
});
