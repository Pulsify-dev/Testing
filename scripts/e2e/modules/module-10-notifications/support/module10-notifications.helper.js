import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module10Env() {
    return {
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module10Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function loginAndOpenNotifications(page) {
    const { testUserEmail, testUserPassword } = module10Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/notifications/);
}

export function notificationLocators(page) {
    return {
        container: page.locator('.notif-page-container'),
        content: page.locator('.notif-page-content'),
        header: page.locator('.notif-header'),
        list: page.locator('.notif-list'),
        emptyState: page.locator('.notif-empty-state'),
        notifItem: page.locator('.notif-item'),
        unreadItem: page.locator('.notif-item.unread'),
        filterDropdown: page.locator('.notif-filter-dropdown'),
        markAllReadBtn: page.locator('button').filter({ hasText: /mark all|read all/i }).first(),
    };
}
