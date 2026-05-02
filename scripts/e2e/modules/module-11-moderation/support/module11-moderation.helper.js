import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module11Env() {
    return {
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
        testTrackId: process.env.TEST_TRACK_ID || '69d67db1f279d83706cfbda8',
        adminEmail: process.env.ADMIN_USER_EMAIL,
        adminPassword: process.env.ADMIN_USER_PASSWORD,
    };
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module11Env();
    return Boolean(testUserEmail && testUserPassword);
}

export function hasAdminCredentials() {
    const { adminEmail, adminPassword } = module11Env();
    return Boolean(adminEmail && adminPassword);
}

export async function loginAndOpenHome(page) {
    const { testUserEmail, testUserPassword } = module11Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/discover');
    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });
}

export async function loginAndOpenTrack(page) {
    const { testUserEmail, testUserPassword, testTrackId } = module11Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export async function loginAsAdmin(page) {
    const { adminEmail, adminPassword } = module11Env();
    await loginViaUi(page, adminEmail, adminPassword);
}

export function moderationLocators(page) {
    return {
        reportBtn: page.locator('button, [role="button"]').filter({ hasText: /report/i }).first(),
        reportModal: page.locator('.sc-report-modal-overlay'),
        reportReasonSelect: page.locator('.sc-report-modal-overlay select'),
        reportSubmitBtn: page.locator('.sc-report-modal-overlay button').filter({ hasText: /submit report/i }),
        reportSuccessMsg: page.locator('text=/report submitted successfully/i'),
        adminPanel: page.locator('[class*="admin"], [class*="dashboard"]').first(),
        trackListTable: page.locator('table, [class*="track-list"], [class*="content-list"]').first(),
        analyticsPanel: page.locator('[class*="analytics"], [class*="stats"], [class*="health"]').first(),
    };
}
