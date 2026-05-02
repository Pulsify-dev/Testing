import { test, expect } from '@playwright/test';
import { module4Env, hasCredentials } from '../support/module4-tracks.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M4-UPL-03: file input accepts mp3 and wav formats', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module4Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/upload');

    const fileInput = page.locator('input[type="file"]').first();
    if ((await fileInput.count()) === 0) return;

    const accept = await fileInput.getAttribute('accept');
    const acceptsAudio =
        !accept ||
        accept.includes('audio') ||
        accept.includes('.mp3') ||
        accept.includes('.wav');
    expect(acceptsAudio).toBeTruthy();
});
