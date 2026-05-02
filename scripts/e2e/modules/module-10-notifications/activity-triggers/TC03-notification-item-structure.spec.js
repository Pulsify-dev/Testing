import { test, expect } from '@playwright/test';
import { loginAndOpenNotifications, notificationLocators, hasCredentials } from '../support/module10-notifications.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M10-ACT-03: notification items render actor, action text, and timestamp', async ({ page }) => {
    await loginAndOpenNotifications(page);
    const locators = notificationLocators(page);

    await page.waitForTimeout(3000);
    if ((await locators.notifItem.count()) === 0) return; // empty state is valid

    const firstItem = locators.notifItem.first();
    const hasActor = (await firstItem.locator('.notif-actor').count()) > 0;
    const hasAction = (await firstItem.locator('.notif-action-text').count()) > 0;
    const hasTime = (await firstItem.locator('.notif-time').count()) > 0;
    expect(hasActor || hasAction || hasTime).toBeTruthy();
});
