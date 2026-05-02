import { test, expect } from '@playwright/test';
import { loginAndOpenArtistStudio, openAddToPlaylistPanel, playlistLocators, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M7-DET-02: creating a new playlist and adding a track shows success confirmation', async ({ page }) => {
    await loginAndOpenArtistStudio(page);

    // Register dialog handler BEFORE triggering the action that causes it
    let dialogMessage = '';
    page.on('dialog', async dlg => {
        dialogMessage = dlg.message();
        await dlg.accept();
    });

    await openAddToPlaylistPanel(page);

    const locators = playlistLocators(page);
    await expect(locators.createPlaylistBtn).toBeVisible({ timeout: 5000 });
    await locators.createPlaylistBtn.click();
    await page.waitForTimeout(800);

    // Fill in the required playlist title ("Playlist title *" label, input has no placeholder)
    const titleInput = page.locator('text=/Playlist title/i').locator('xpath=following::input[1]');
    await expect(titleInput).toBeVisible({ timeout: 5000 });
    await titleInput.fill('E2E Test Playlist');

    await expect(locators.saveBtn).toBeVisible({ timeout: 5000 });
    await locators.saveBtn.click();
    await page.waitForTimeout(2000);

    // Success: browser alert says "Playlist created and track added!"
    expect(dialogMessage).toMatch(/Playlist created and track added/i);
});
