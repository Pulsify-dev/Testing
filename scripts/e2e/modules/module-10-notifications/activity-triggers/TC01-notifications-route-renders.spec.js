import { test, expect } from '@playwright/test';
import { loginAndOpenNotifications, notificationLocators, hasCredentials } from '../support/module10-notifications.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M10-ACT-01: /notifications page renders for authenticated user', async ({ page }) => {
    await loginAndOpenNotifications(page);
    const locators = notificationLocators(page);

    await expect(
        locators.container.or(locators.content).or(page.locator('.app-shell')).first()
    ).toBeVisible({ timeout: 15000 });
});
