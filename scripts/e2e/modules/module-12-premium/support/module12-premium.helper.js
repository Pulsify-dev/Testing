import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module12Env() {
    return {
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
        testTrackId: process.env.TEST_TRACK_ID || '69d67db1f279d83706cfbda8',
    };
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module12Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function loginAndGoHome(page) {
    const { testUserEmail, testUserPassword } = module12Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/home');
    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });
}

export async function loginAndOpenUpload(page) {
    const { testUserEmail, testUserPassword } = module12Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/upload');
}

export function premiumLocators(page) {
    return {
        upgradeBtn: page.locator('button, a, [role="button"]').filter({ hasText: /upgrade|go\+|pro|premium/i }).first(),
        subscriptionPage: page.locator('[class*="subscription"], [class*="pricing"], [class*="upgrade"]').first(),
        uploadLimitMsg: page.locator('text=/upload limit|3 track|free plan|upgrade to upload/i').first(),
        stripeForm: page.locator('[class*="stripe"], input[name*="card"], iframe[name*="stripe"]').first(),
        downloadBtn: page.locator('button, [role="button"]').filter({ hasText: /download|offline/i }).first(),
        paywallGate: page.locator('[class*="paywall"], [class*="gate"], [class*="upsell"]').first(),
    };
}
