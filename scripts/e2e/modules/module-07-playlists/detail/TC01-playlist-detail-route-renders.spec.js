import { test, expect } from '@playwright/test';
import { loginAndOpenArtistStudio, openAddToPlaylistPanel, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M7-DET-01: Add to playlist panel opens and shows playlists or create option', async ({ page }) => {
    await loginAndOpenArtistStudio(page);
    await openAddToPlaylistPanel(page);

    // Panel heading must be visible
    await expect(page.locator('text=Add to playlist').first()).toBeVisible({ timeout: 5000 });

    // Either existing playlists are listed (each showing a track count or name)
    // or the "Create playlist" option is present (empty state)
    const trackCountLabels = page.locator('text=/[0-9]+ track/i');
    const hasTrackCounts = (await trackCountLabels.count()) > 0;
    const hasCreateOption = (await page.locator('text=Create playlist').count()) > 0;

    // At least one of these must be true — panel must not be empty
    expect(hasTrackCounts || hasCreateOption).toBeTruthy();
});
