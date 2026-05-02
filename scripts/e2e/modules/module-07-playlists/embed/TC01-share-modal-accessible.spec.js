import { test, expect } from '@playwright/test';
import { loginAndOpenArtistStudio, hasCredentials } from '../support/module7-playlists.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M7-EMB-01: track context menu exposes Copy link action for sharing', async ({ page }) => {
    await loginAndOpenArtistStudio(page);

    // Wait for at least one track row (identified by the Amplify button)
    const firstAmplify = page.locator('button').filter({ hasText: /Amplify/i }).first();
    await expect(firstAmplify).toBeVisible({ timeout: 10000 });

    // Find the row containing the first Amplify button and click its last button (⋮)
    const trackRow = page.locator('tr').filter({
        has: page.locator('button').filter({ hasText: /Amplify/i }),
    }).first();

    if (await trackRow.count() > 0) {
        await trackRow.locator('button').last().click();
    } else {
        // Fallback: ⋮ is the next button directly after Amplify
        await firstAmplify.locator('xpath=following::button[1]').click();
    }
    await page.waitForTimeout(800);

    // "Copy link" must be visible in the context menu
    await expect(page.locator('text=Copy link').first()).toBeVisible({ timeout: 5000 });
});
