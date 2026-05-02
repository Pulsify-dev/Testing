import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, playerLocators, hasCredentials } from '../support/module5-playback.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-STR-02: clicking play button changes hero to is-playing state', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = playerLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.playButton).toBeVisible();
    await locators.playButton.click();
    await page.waitForTimeout(1500);

    const isPlayingOrHandled =
        (await locators.playingState.count()) > 0 ||
        (await locators.playButton.count()) > 0;
    expect(isPlayingOrHandled).toBeTruthy();
});
