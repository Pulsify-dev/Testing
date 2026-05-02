import { test, expect } from '@playwright/test';
import { loginAndOpenMessages, messagingLocators, hasCredentials } from '../support/module9-messaging.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M9-DM-02: messages page renders layout for authenticated user', async ({ page }) => {
    await loginAndOpenMessages(page);
    const locators = messagingLocators(page);

    await expect(
        locators.messagesPage.or(locators.messagesLayout).or(page.locator('.app-shell')).first()
    ).toBeVisible({ timeout: 15000 });
});
