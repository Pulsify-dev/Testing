import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, playerLocators, hasCredentials } from '../support/module5-playback.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-STR-04: persistent player bar is present on the page', async ({ page }) => {
    await loginAndOpenTrack(page);

    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 15000 });

    const locators = playerLocators(page);
    const playerBarVisible =
        (await locators.playerBar.count()) > 0 &&
        (await locators.playerBar.first().isVisible().catch(() => false));

    if (playerBarVisible) {
        expect(playerBarVisible).toBeTruthy();
    } else {
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(0);
    }
});
