import { test, expect } from '@playwright/test';
import { loginAndOpenArtistStudio, openAddToPlaylistPanel, playlistLocators, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M7-PRV-01: create playlist form offers both Public and Private privacy options', async ({ page }) => {
    await loginAndOpenArtistStudio(page);
    await openAddToPlaylistPanel(page);

    const locators = playlistLocators(page);
    await expect(locators.createPlaylistBtn).toBeVisible({ timeout: 5000 });
    await locators.createPlaylistBtn.click();
    await page.waitForTimeout(800);

    // Both Public and Private options must be present
    await expect(locators.privacyPublicBtn).toBeVisible({ timeout: 5000 });
    await expect(locators.privacyPrivateBtn).toBeVisible({ timeout: 5000 });
});
