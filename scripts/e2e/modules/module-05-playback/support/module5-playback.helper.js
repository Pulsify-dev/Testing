import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module5Env() {
    return {
        testTrackId: process.env.TEST_TRACK_ID || '69d67db1f279d83706cfbda8',
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasTrackId() {
    return Boolean(module5Env().testTrackId);
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module5Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function openTrack(page) {
    const { testTrackId } = module5Env();
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export async function loginAndOpenTrack(page) {
    const { testUserEmail, testUserPassword, testTrackId } = module5Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export function playerLocators(page) {
    return {
        trackHero: page.locator('.track-hero'),
        playButton: page.locator('.hero-play'),
        playingState: page.locator('.hero-play.is-playing'),
        waveform: page.locator('.track-waveform'),
        playbackStateChip: page.locator('[class*="playback-state-chip"]'),
        playerBar: page.locator('.player-dock-main, .player-dock, .pulsify-player-bar, .player-bar, [class*="player-bar"], [class*="PlayerBar"]'),
        historySection: page.locator('.playback-history-section'),
        recentlyPlayedGrid: page.locator('.recently-played-grid'),
        historyFilter: page.locator('.playback-history-filter input, input[placeholder="Filter"]'),
    };
}
