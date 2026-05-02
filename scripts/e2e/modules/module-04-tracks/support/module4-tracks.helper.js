import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module4Env() {
    return {
        testTrackId: process.env.TEST_TRACK_ID || '69d67db1f279d83706cfbda8',
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasTrackId() {
    return Boolean(module4Env().testTrackId);
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module4Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function openTrack(page) {
    const { testTrackId } = module4Env();
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export async function loginAndOpenTrack(page) {
    const { testUserEmail, testUserPassword, testTrackId } = module4Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export function trackPageLocators(page) {
    return {
        trackHero: page.locator('.track-hero'),
        heroTitle: page.locator('.track-hero h1'),
        artistChip: page.locator('.track-artist-chip'),
        typePill: page.locator('.track-type-pill'),
        playButton: page.locator('.hero-play'),
        waveform: page.locator('.track-waveform'),
        durationBadge: page.locator('.track-duration-badge'),
        actionsRow: page.locator('.track-actions-row'),
        unavailableState: page.locator('.app-shell'),
    };
}

export async function isTrackLoaded(page) {
    const hero = page.locator('.track-hero');
    const unavailable = page.locator('text=/unavailable|not found/i');
    const loading = page.locator('.loading-state, [class*="loading"]');
    return (
        (await hero.count()) > 0 ||
        (await unavailable.count()) > 0 ||
        (await loading.count()) > 0
    );
}
