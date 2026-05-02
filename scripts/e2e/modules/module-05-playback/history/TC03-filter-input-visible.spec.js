import { test, expect } from '@playwright/test';
import { module5Env, hasCredentials, playerLocators } from '../support/module5-playback.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-HIS-03: filter input is visible on history page', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module5Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/history');

    await expect(page.locator('.playback-history-section').first()).toBeVisible({ timeout: 10000 });

    const locators = playerLocators(page);
    await expect(locators.historyFilter).toBeVisible();
});
