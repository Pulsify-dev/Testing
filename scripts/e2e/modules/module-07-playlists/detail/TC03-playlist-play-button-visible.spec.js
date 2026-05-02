import { test, expect } from '@playwright/test';
import { loginAndOpenArtistStudio, openAddToPlaylistPanel, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M7-DET-03: Add to playlist panel shows per-playlist action buttons or a create option', async ({ page }) => {
    await loginAndOpenArtistStudio(page);
    await openAddToPlaylistPanel(page);

    // Panel heading must be visible
    await expect(page.locator('text=Add to playlist').first()).toBeVisible({ timeout: 5000 });

    // If the user has existing playlists, each one exposes its own action button
    const addBtns = page.locator('button').filter({ hasText: /^Add to playlist$/ });
    const count = await addBtns.count();

    if (count > 0) {
        await expect(addBtns.first()).toBeVisible({ timeout: 5000 });
    } else {
        // No playlists yet — "Create playlist" must be available as the only action
        await expect(page.locator('text=Create playlist').first()).toBeVisible({ timeout: 5000 });
    }
});
