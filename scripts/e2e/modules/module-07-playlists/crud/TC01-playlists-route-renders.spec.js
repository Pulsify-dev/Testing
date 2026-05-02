import { test, expect } from '@playwright/test';
import { loginAndOpenArtistStudio, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M7-CRU-01: Artist Studio at /my-tracks renders with track list', async ({ page }) => {
    await loginAndOpenArtistStudio(page);

    // Heading confirmed in screenshots
    await expect(page.locator('text=Artist Studio').first()).toBeVisible({ timeout: 15000 });

    // Action bar buttons always visible when tracks exist
    await expect(page.locator('text=Upload or drop tracks').first()).toBeVisible({ timeout: 10000 });

    // Filter controls (All / Public / Private) confirm the list rendered
    await expect(page.locator('button, [role="button"]').filter({ hasText: /^All$/ }).first()).toBeVisible({ timeout: 10000 });

    // Page must not show an error
    await expect(page.locator('text=/401|request failed|something went wrong/i')).toHaveCount(0);
});
