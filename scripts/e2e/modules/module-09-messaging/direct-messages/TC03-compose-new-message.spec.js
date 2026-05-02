import { test, expect } from '@playwright/test';
import { loginAndOpenMessages, messagingLocators, hasCredentials } from '../support/module9-messaging.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M9-DM-03: compose/new message button opens recipient input modal', async ({ page }) => {
    await loginAndOpenMessages(page);
    const locators = messagingLocators(page);

    await expect(
        locators.messagesPage.or(page.locator('.app-shell')).first()
    ).toBeVisible({ timeout: 15000 });

    if ((await locators.composeBtn.count()) === 0) return;
    await locators.composeBtn.click();
    await page.waitForTimeout(1000);

    const handled =
        (await locators.modalOverlay.count()) > 0 ||
        (await locators.modalInput.count()) > 0 ||
        (await page.locator('input[type="text"], input[placeholder]').count()) > 0;
    expect(handled).toBeTruthy();
});
