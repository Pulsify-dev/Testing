import { test, expect } from '@playwright/test';
import { assertCoreTabs, hasCredentials, loginAndOpenSocialRoute } from '../support/module3-social.helper.js';

test.describe('Module 3 Navigation', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated social tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenSocialRoute(page, '/following');
    });

    test('TC-M3-NAV-01: social tabs navigate to following, followers, and blocked routes', async ({ page }) => {
        await assertCoreTabs(page);
        await expect(page.locator('.sc-social-page__title')).toContainText('Hear what the people you follow have posted');
        await expect(page.locator('.sc-social-filter__input')).toBeVisible();

        await page.click('.sc-social-tabs a[href="/followers"]');
        await expect(page).toHaveURL(/\/followers/);
        await expect(page.locator('.sc-social-page__title')).toContainText('People who follow you');
        await expect(page.locator('.sc-social-filter__input')).toBeVisible();

        await page.click('.sc-social-tabs a[href="/blocked"]');
        await expect(page).toHaveURL(/\/blocked/);
        await expect(page.locator('.sc-social-page__title')).toContainText('Blocked Users');
    });
});
