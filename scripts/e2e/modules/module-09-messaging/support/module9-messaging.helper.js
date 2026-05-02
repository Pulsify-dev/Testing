import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module9Env() {
    return {
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module9Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function loginAndOpenMessages(page) {
    const { testUserEmail, testUserPassword } = module9Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/messages');
    await expect(page).toHaveURL(/\/messages/);
}

export function messagingLocators(page) {
    return {
        messagesPage: page.locator('.messages-page'),
        messagesLayout: page.locator('.messages-layout'),
        composeBtn: page.locator('button, [role="button"]').filter({ hasText: /compose|new message|new chat/i }).first(),
        modalOverlay: page.locator('.messages-modal-overlay'),
        modalInput: page.locator('.messages-modal-input'),
        modalTextarea: page.locator('.messages-modal-textarea'),
        primaryBtn: page.locator('.messages-primary-btn'),
    };
}
