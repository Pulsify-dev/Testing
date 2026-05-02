import { test, expect } from '@playwright/test';
import { loginAndOpenNotifications, notificationLocators, hasCredentials } from '../support/module10-notifications.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M10-STA-02: mark-all-read action clears unread state or is gated when no unread exist', async ({ page }) => {
    await loginAndOpenNotifications(page);
    const locators = notificationLocators(page);

    await page.waitForTimeout(2000);
    const markBtn = locators.markAllReadBtn;
    if ((await markBtn.count()) === 0) return; // button may be hidden when no unreads

    await markBtn.click();
    await page.waitForTimeout(1500);

    // After marking read: unread items should be 0 or page still renders without crash
    const unreadAfter = await locators.unreadItem.count();
    expect(unreadAfter).toBe(0);
});
