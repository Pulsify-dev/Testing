import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module8Env() {
    return {
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
        testTrackId: process.env.TEST_TRACK_ID || '69d67db1f279d83706cfbda8',
    };
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module8Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function loginAndOpenFeed(page) {
    const { testUserEmail, testUserPassword } = module8Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/feed');
    await expect(page).toHaveURL(/\/feed/);
}

export function discoveryLocators(page) {
    return {
        discoverPage: page.locator('.sc-discover-page'),
        feedPage: page.locator('.sc-feed-page'),
        searchPage: page.locator('.sc-search-page'),
        chartsPage: page.locator('.sc-charts-page'),
        searchInput: page.locator('.sc-search-input'),
        filterList: page.locator('.sc-filter-list'),
        chartList: page.locator('.sc-chart-list'),
        genreTabs: page.locator('.sc-genre-tabs'),
        feedItems: page.locator('.sc-feed-items-list, .sc-feed-item-card'),
        emptyState: page.locator('.sc-empty-state'),
    };
}
