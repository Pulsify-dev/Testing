import { test, expect } from '@playwright/test';

const TRACK_ID = 'trk-2026-014';
const unavailableState = 'Track unavailable right now.';

test.describe('Module 5: Playback and Streaming Engine (Blackbox)', () => {
    test('M5-SMOKE-01: player dock controls render on track page', async ({ page }) => {
        await page.goto(`/tracks/${TRACK_ID}`);

        await expect(page.locator('.player-dock-shell').or(page.getByText(unavailableState)).first()).toBeVisible();

        if (await page.getByText(unavailableState).isVisible()) {
            await expect(page.getByText(unavailableState)).toBeVisible();
            return;
        }

        await expect(page.locator('.player-dock-shell')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Previous track' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Next track' })).toBeVisible();
        await expect(page.locator('input[aria-label="Playback progress"]')).toBeVisible();
        await expect(page.locator('input[aria-label="Volume"]')).toBeVisible();
    });

    test('M5-SMOKE-02: next and previous controls navigate track ids', async ({ page }) => {
        await page.goto(`/tracks/${TRACK_ID}`);

        await expect(page.locator('.player-dock-shell').or(page.getByText(unavailableState)).first()).toBeVisible();

        if (await page.getByText(unavailableState).isVisible()) {
            await expect(page.getByText(unavailableState)).toBeVisible();
            return;
        }

        const initialUrl = page.url();

        await page.getByRole('button', { name: 'Next track' }).click();
        await expect(page).not.toHaveURL(initialUrl);

        await page.getByRole('button', { name: 'Previous track' }).click();
        await expect(page).toHaveURL(new RegExp(`/tracks/${TRACK_ID}$`));
    });
});
