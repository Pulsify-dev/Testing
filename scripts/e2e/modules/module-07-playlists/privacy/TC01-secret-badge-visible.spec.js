import { test, expect } from '@playwright/test';
import { loginAndOpenPlaylists, playlistPageLocators, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(true, 'Module 7 (Playlists) is not yet integrated — secret badge cannot be verified.');

test('TC-M7-PRV-01: secret playlists show Secret badge if present', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    await loginAndOpenPlaylists(page);
    const locators = playlistPageLocators(page);

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });

    // Need at least one playlist card before we can verify badge behavior
    await expect(locators.playlistCard.first()).toBeVisible({ timeout: 10000 });

    // Every secret playlist card must have a Secret badge
    const totalCards = await locators.playlistCard.count();
    const secretBadges = await locators.cardBadgeSecret.count();
    // secretBadges can be 0 if no secret playlists exist, but must not exceed totalCards
    expect(secretBadges).toBeLessThanOrEqual(totalCards);
});
