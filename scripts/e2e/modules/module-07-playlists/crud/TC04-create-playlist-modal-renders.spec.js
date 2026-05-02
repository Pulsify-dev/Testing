import { test, expect } from '@playwright/test';
import { loginAndOpenArtistStudio, openAddToPlaylistPanel, playlistLocators, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M7-CRU-04: Create playlist form renders with title input and privacy options', async ({ page }) => {
    await loginAndOpenArtistStudio(page);
    await openAddToPlaylistPanel(page);

    const locators = playlistLocators(page);

    // Click "Create playlist" in the panel
    await expect(locators.createPlaylistBtn).toBeVisible({ timeout: 5000 });
    await locators.createPlaylistBtn.click();
    await page.waitForTimeout(800);

    // "Playlist title *" label and its input must be visible
    await expect(page.locator('text=/Playlist title/i').first()).toBeVisible({ timeout: 5000 });
    await expect(locators.playlistTitleInput).toBeVisible({ timeout: 5000 });

    // Description textarea (placeholder: "Describe your playlist.")
    await expect(page.locator('textarea[placeholder*="Describe" i], textarea').first()).toBeVisible({ timeout: 5000 });

    // Privacy toggle: both Public and Private options must be present
    await expect(locators.privacyPublicBtn).toBeVisible({ timeout: 5000 });
    await expect(locators.privacyPrivateBtn).toBeVisible({ timeout: 5000 });

    // Save and Cancel buttons must be present
    await expect(locators.saveBtn).toBeVisible({ timeout: 5000 });
    await expect(locators.cancelBtn).toBeVisible({ timeout: 5000 });
});
