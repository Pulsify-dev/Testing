import { test, expect } from '@playwright/test';
import { module4Env, hasCredentials } from '../support/module4-tracks.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M4-UPL-04: upload page shows paywall overlay or upload form (handled state)', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module4Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/upload');

    const paywall = page.locator('.pulsify-paywall-overlay');
    const uploadBody = page.locator('.pulsify-upload-body');
    const uploadPage = page.locator('.pulsify-upload-page');

    const handled =
        (await paywall.count()) > 0 ||
        (await uploadBody.count()) > 0 ||
        (await uploadPage.count()) > 0;
    expect(handled).toBeTruthy();
});
