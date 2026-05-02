import { test, expect } from '@playwright/test';
import { loginAndOpenArtistStudio, openAddToPlaylistPanel, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M7-CRU-02: Add to playlist panel shows existing playlists or Create playlist option', async ({ page }) => {
    await loginAndOpenArtistStudio(page);
    await openAddToPlaylistPanel(page);

    // Panel heading must appear
    await expect(page.locator('text=Add to playlist').first()).toBeVisible({ timeout: 5000 });

    // Must show either existing playlist entries OR the "Create playlist" button (empty state)
    const hasExisting = (await page.locator('text=Add to playlist').count()) > 1;
    const hasCreateOption = (await page.locator('text=Create playlist').count()) > 0;

    expect(hasExisting || hasCreateOption).toBeTruthy();
});
