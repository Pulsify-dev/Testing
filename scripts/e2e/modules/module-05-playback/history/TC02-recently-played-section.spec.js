import { test, expect } from '@playwright/test';
import { module5Env, hasCredentials, playerLocators } from '../support/module5-playback.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-HIS-02: recently played section shows cards or empty state', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module5Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/history');

    const locators = playerLocators(page);
    const grid = locators.recentlyPlayedGrid;
    const section = page.locator('.playback-history-section');

    await expect(section.first()).toBeVisible({ timeout: 10000 });

    const hasGrid = (await grid.count()) > 0;
    const hasEmpty = (await page.locator('text=/no tracks|no history|empty/i').count()) > 0;
    expect(hasGrid || hasEmpty).toBeTruthy();
});
