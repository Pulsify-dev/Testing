import { test, expect } from '@playwright/test';
import { loginAndOpenPlaylists, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(true, 'Module 7 (Playlists) is not yet integrated — route returns 401 for all users.');

test('TC-M7-CRU-01: /playlists route renders without crashing', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    await loginAndOpenPlaylists(page);
    const shell = page.locator('.app-shell');
    await expect(shell.first()).toBeVisible({ timeout: 15000 });
    // Assert the route did NOT return a generic error
    await expect(page.locator('text=/request failed|401|unauthorized/i')).toHaveCount(0, { timeout: 5000 });
});
