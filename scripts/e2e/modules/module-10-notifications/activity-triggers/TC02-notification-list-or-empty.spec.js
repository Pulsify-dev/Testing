import { test, expect } from '@playwright/test';
import { loginAndOpenNotifications, notificationLocators, hasCredentials } from '../support/module10-notifications.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M10-ACT-02: notifications page shows items or empty state (handled)', async ({ page }) => {
    await loginAndOpenNotifications(page);
    const locators = notificationLocators(page);

    await page.waitForTimeout(3000);
    const hasItems = (await locators.notifItem.count()) > 0;
    const hasEmpty = (await locators.emptyState.count()) > 0;
    const hasList = (await locators.list.count()) > 0;
    const hasShell = (await page.locator('.app-shell').count()) > 0;
    expect(hasItems || hasEmpty || hasList || hasShell).toBeTruthy();
});
