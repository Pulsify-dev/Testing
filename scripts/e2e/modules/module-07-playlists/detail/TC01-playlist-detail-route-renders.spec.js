import { test, expect } from '@playwright/test';
import { loginAndOpenPlaylists, playlistPageLocators, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(true, 'Module 7 (Playlists) is not yet integrated — detail navigation cannot be verified.');

test('TC-M7-DET-01: clicking a playlist card navigates to detail route', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    await loginAndOpenPlaylists(page);
    const locators = playlistPageLocators(page);

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });

    // A playlist card must exist — empty state is not a pass condition for navigation test
    await expect(locators.cardName.first()).toBeVisible({ timeout: 10000 });
    await locators.cardName.first().click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/playlists\//);
});
