import { test, expect } from '@playwright/test';
import { loginAndOpenPlaylists, playlistPageLocators, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(true, 'Module 7 (Playlists) is not yet integrated — play button cannot be verified.');

test('TC-M7-DET-03: playlist card shows play button overlay', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    await loginAndOpenPlaylists(page);
    const locators = playlistPageLocators(page);

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });

    // A playlist card must exist — no cards means no play button to verify
    await expect(locators.playlistCard.first()).toBeVisible({ timeout: 10000 });
    await expect(locators.cardPlayBtn.first()).toBeVisible({ timeout: 5000 });
});
