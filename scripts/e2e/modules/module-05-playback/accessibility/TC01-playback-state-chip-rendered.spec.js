import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, playerLocators, hasCredentials } from '../support/module5-playback.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-ACC-01: playback state chip renders (Playable / Preview / Blocked)', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = playerLocators(page);

    await expect(page.locator('.track-hero, .app-shell').first()).toBeVisible({ timeout: 15000 });
    if ((await page.locator('.track-hero').count()) === 0) return;

    await expect(locators.playbackStateChip).toBeVisible();
    const chipText = await locators.playbackStateChip.innerText();
    expect(chipText.trim().length).toBeGreaterThan(0);
});
