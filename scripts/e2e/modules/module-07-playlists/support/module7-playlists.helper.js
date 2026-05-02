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

export async function loginAndOpenPlaylists(page) {
    const { testUserEmail, testUserPassword } = module7Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/playlists');
    await expect(page).toHaveURL(/\/playlists/);
}

export async function openPlaylists(page) {
    await page.goto('/playlists');
    await expect(page).toHaveURL(/\/playlists/);
}

export function playlistPageLocators(page) {
    return {
        grid: page.locator('.pulsify-grid-container'),
        playlistCard: page.locator('.pulsify-playlist-card'),
        cardName: page.locator('.pulsify-card-name'),
        cardArtist: page.locator('.pulsify-card-artist'),
        cardPlayBtn: page.locator('.pulsify-card-play-btn'),
        cardBadgeSecret: page.locator('.pulsify-badge-secret'),
        cardTrackCount: page.locator('.pulsify-track-count'),
        createModalOverlay: page.locator('.pulsify-modal-overlay'),
        createModalContent: page.locator('.pulsify-modal-content'),
        createInput: page.locator('.pulsify-input').first(),
    };
}
