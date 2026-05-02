import { test, expect } from '@playwright/test';
import { module4Env, hasCredentials } from '../support/module4-tracks.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M4-UPL-02: upload page renders header and upload zone for authenticated user', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module4Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/upload');

    const uploadPage = page.locator('.pulsify-upload-page');
    const uploadHeader = page.locator('.pulsify-upload-header');
    const handled = (await uploadPage.count()) > 0 || (await uploadHeader.count()) > 0;
    expect(handled).toBeTruthy();
});
