import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module6Env() {
    return {
        testTrackId: process.env.TEST_TRACK_ID || '69d67db1f279d83706cfbda8',
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasTrackId() {
    return Boolean(module6Env().testTrackId);
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module6Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function openTrack(page) {
    const { testTrackId } = module6Env();
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export async function loginAndOpenTrack(page) {
    const { testUserEmail, testUserPassword, testTrackId } = module6Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export function engagementLocators(page) {
    return {
        trackHero: page.locator('.track-hero'),
        actionsRow: page.locator('.track-actions-row'),
        likeButton: page.locator('.track-actions-row').getByRole('button', { name: /like/i }),
        repostButton: page.locator('.track-actions-row').getByRole('button', { name: /repost/i }),
        statRow: page.getByText(/\d+\s+(plays|likes|reposts)/i).first(),
        commentBar: page.locator('.social-comment-bar'),
        commentsPanel: page.locator('.comments-panel'),
        timestampOption: page.locator('.timestamp-option'),
        sectionListPanel: page.locator('.section-list-panel'),
    };
}

export async function isTrackHeroVisible(page) {
    return (await page.locator('.track-hero').count()) > 0;
}
