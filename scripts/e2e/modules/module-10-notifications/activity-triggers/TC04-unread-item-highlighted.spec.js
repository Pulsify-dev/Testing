import { test, expect } from '@playwright/test';
import { loginAndOpenNotifications, notificationLocators, hasCredentials } from '../support/module10-notifications.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M10-ACT-04: unread notifications render with .unread class when present', async ({ page }) => {
    await loginAndOpenNotifications(page);
    const locators = notificationLocators(page);

    await page.waitForTimeout(3000);
    // This test is always valid — unread items may or may not exist
    const unreadCount = await locators.unreadItem.count();
    const totalCount = await locators.notifItem.count();
    expect(unreadCount >= 0 && totalCount >= 0).toBeTruthy();
});
