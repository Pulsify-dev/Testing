import { test, expect } from '@playwright/test';
import { loginAndOpenPlaylists, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(true, 'Module 7 (Playlists) is not yet integrated — privacy toggle cannot be verified.');

test('TC-M7-PRV-02: create playlist modal exposes privacy/secret toggle', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    await loginAndOpenPlaylists(page);

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });

    const createBtn = page.locator('button, [role="button"]').filter({ hasText: /create|new playlist/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 10000 });
    await createBtn.click();
    await page.waitForTimeout(1000);

    // Modal must be open AND a privacy control must be visible
    await expect(page.locator('.pulsify-modal-overlay, .pulsify-modal-content')).toBeVisible({ timeout: 5000 });
    const privacyControl = page.locator(
        '.pulsify-checkbox-group, input[type="checkbox"], select, [class*="secret"], [class*="private"]'
    );
    await expect(privacyControl.first()).toBeVisible({ timeout: 5000 });
});
