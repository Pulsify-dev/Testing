import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module7Env() {
    return {
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module7Env();
    return Boolean(testUserEmail && testUserPassword);
}

// Playlists are managed from the Artist Studio at /my-tracks
export async function loginAndOpenArtistStudio(page) {
    const { testUserEmail, testUserPassword } = module7Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/my-tracks');
    await expect(page.locator('text=Artist Studio').first()).toBeVisible({ timeout: 15000 });
}

// Opens the "Add to playlist" side panel for the first track in the list.
// Each track row ends with an Amplify button followed by a ⋮ icon button.
export async function openAddToPlaylistPanel(page) {
    // Wait for tracks to be visible (Amplify button is unique to track rows)
    const firstAmplify = page.locator('button').filter({ hasText: /Amplify/i }).first();
    await expect(firstAmplify).toBeVisible({ timeout: 10000 });

    // Find the table row that contains the first Amplify button, then click its last button (⋮)
    const trackRow = page.locator('tr').filter({
        has: page.locator('button').filter({ hasText: /Amplify/i }),
    }).first();

    if (await trackRow.count() > 0) {
        await trackRow.locator('button').last().click();
    } else {
        // Fallback: the ⋮ button is the very next button after the first Amplify button
        await firstAmplify.locator('xpath=following::button[1]').click();
    }
    await page.waitForTimeout(800);

    // Click "Add to playlist" from the context menu dropdown
    await page.locator('text=Add to playlist').first().click();
    await page.waitForTimeout(800);
}

export function playlistLocators(page) {
    return {
        artistStudioHeading: page.locator('text=Artist Studio').first(),
        addToPlaylistPanel: page.locator('text=Add to playlist').first(),
        createPlaylistBtn: page.locator('text=Create playlist').first(),
        // Title input has no placeholder — "Playlist title *" is a label above it
        playlistTitleInput: page.locator('text=/Playlist title/i').locator('xpath=following::input[1]'),
        // Anchored to "Playlist privacy" label — avoids matching the Artist Studio
        // filter buttons ("Public" / "Private") that stay in the DOM behind the panel.
        // "Public" is the first button after the label; "Private" is the second.
        privacyPublicBtn: page.locator('text=/Playlist privacy/i').locator('xpath=following::button[1]'),
        privacyPrivateBtn: page.locator('text=/Playlist privacy/i').locator('xpath=following::button[2]'),
        saveBtn: page.locator('button').filter({ hasText: /^Save$/ }).first(),
        cancelBtn: page.locator('button').filter({ hasText: /^Cancel$/ }).first(),
    };
}
