import { test, expect } from '@playwright/test';
import { loginAndOpenPlaylists, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(true, 'Module 7 (Playlists) is not yet integrated — create modal cannot be verified.');

test('TC-M7-CRU-04: create playlist modal renders title input when triggered', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    await loginAndOpenPlaylists(page);

    const createBtn = page.locator('button, [role="button"]').filter({ hasText: /create|new playlist/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 10000 });

    await createBtn.click();
    await page.waitForTimeout(1000);

    // Modal must open with a title input — both are required for this feature
    await expect(page.locator('.pulsify-modal-overlay, .pulsify-modal-content')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.pulsify-input, input[type="text"]').first()).toBeVisible({ timeout: 5000 });
});
