import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module3Env() {
    return {
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module3Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function loginAndOpenSocialRoute(page, route = '/following') {
    const { testUserEmail, testUserPassword } = module3Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(route));
    await expect(page.locator('.sc-social-page')).toBeVisible();
}

export async function assertCoreTabs(page) {
    await expect(page.locator('.sc-social-tabs a[href="/following"]')).toBeVisible();
    await expect(page.locator('.sc-social-tabs a[href="/followers"]')).toBeVisible();
    await expect(page.locator('.sc-social-tabs a[href="/blocked"]')).toBeVisible();
}

export async function hasUserListHandledState(page) {
    const hasCards = (await page.locator('.sc-user-card').count()) > 0;
    const hasEmpty = (await page.locator('.sc-social-empty').count()) > 0;
    const hasRetry = (await page.locator('.sc-social-retry').count()) > 0;
    const hasSkeleton = (await page.locator('.sc-user-card--skeleton').count()) > 0;
    return hasCards || hasEmpty || hasRetry || hasSkeleton;
}

export async function hasBlockedListHandledState(page) {
    const hasRows = (await page.locator('.sc-blocked-row').count()) > 0;
    const hasEmpty = (await page.locator('.sc-social-empty').count()) > 0;
    const hasRetry = (await page.locator('.sc-social-retry').count()) > 0;
    const hasSkeleton = (await page.locator('.sc-blocked-row--skeleton').count()) > 0;
    return hasRows || hasEmpty || hasRetry || hasSkeleton;
}

export async function normalizeLabel(locator) {
    const text = ((await locator.innerText()) || '').replaceAll(/\s+/g, ' ').trim().toLowerCase();
    return text;
}
