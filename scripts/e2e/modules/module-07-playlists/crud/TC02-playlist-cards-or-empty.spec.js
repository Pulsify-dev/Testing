import { test, expect } from '@playwright/test';
import { loginAndOpenPlaylists, playlistPageLocators, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(true, 'Module 7 (Playlists) is not yet integrated — playlist content cannot be verified.');

test('TC-M7-CRU-02: playlists page shows cards or empty state (handled)', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    await loginAndOpenPlaylists(page);
    const locators = playlistPageLocators(page);

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });

    // Must show either playlist cards or an explicit empty state message — not a generic error
    const hasCards = (await locators.playlistCard.count()) > 0;
    const hasEmpty = (await page.locator('text=/no playlist|empty|create/i').count()) > 0;
    expect(hasCards || hasEmpty).toBeTruthy();
});
