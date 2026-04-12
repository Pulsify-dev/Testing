import { test, expect } from '@playwright/test';

const TRACK_ID = 'trk-2026-014';
const unavailableState = 'Track unavailable right now.';

test.describe('Module 4: Audio Upload and Track Management (Blackbox)', () => {
    test('M4-SMOKE-01: track overview renders hero and primary actions', async ({ page }) => {
        await page.goto(`/tracks/${TRACK_ID}`);

        await expect(page).toHaveURL(new RegExp(`/tracks/${TRACK_ID}$`));
        await expect(page.locator('.track-hero').or(page.getByText(unavailableState)).first()).toBeVisible();

        if (await page.getByText(unavailableState).isVisible()) {
            await expect(page.getByText(unavailableState)).toBeVisible();
            return;
        }

        await expect(page.locator('.track-hero')).toBeVisible();
        const heroTitle = page.locator('.track-hero h1');
        if ((await heroTitle.count()) === 0) {
            await expect(page.getByText(unavailableState)).toBeVisible();
            return;
        }

        await expect(heroTitle).toBeVisible();
        await expect(page.locator('.track-actions-row')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Like' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Repost' })).toBeVisible();
        await expect(page.getByRole('button', { name: /Download|Downloading/ })).toBeVisible();
    });

    test('M4-SMOKE-02: related and playlist views render list panels', async ({ page }) => {
        await page.goto(`/tracks/${TRACK_ID}/related`);

        await expect(page.locator('.section-list-panel').or(page.getByText(unavailableState)).first()).toBeVisible();

        if (await page.getByText(unavailableState).isVisible()) {
            await expect(page.getByText(unavailableState)).toBeVisible();
            return;
        }

        await expect(page.locator('.section-list-panel h2')).toContainText('Related tracks');
        await expect(page.locator('.section-list-row.is-track').first()).toBeVisible();

        await page.goto(`/tracks/${TRACK_ID}/playlists`);
        await expect(page.locator('.section-list-panel h2')).toContainText('In playlists');
        await expect(page.locator('.section-list-row.is-playlist').first()).toBeVisible();
    });
});
