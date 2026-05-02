import { test, expect } from '@playwright/test';
import { module5Env, hasCredentials } from '../support/module5-playback.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-HIS-01: /history page loads and renders playback history section', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module5Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/history');
    await expect(page).toHaveURL(/\/history/);

    await page.waitForSelector('.app-shell', { timeout: 15000 });
    await page.waitForSelector('.playback-history-section', { timeout: 20000 });
});
