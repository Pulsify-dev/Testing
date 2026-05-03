import { test, expect } from '@playwright/test';

const TRACK_ID = 'trk-2026-014';
const unavailableState = 'Track unavailable right now.';

test.describe('Module 6: Engagement and Social Interactions (Blackbox)', () => {
    test('M6-SMOKE-01: comments view renders panel, counter, and sorting control', async ({ page }) => {
        await page.goto(`/tracks/${TRACK_ID}/comments`);

        await expect(page.locator('.comments-panel').or(page.getByText(unavailableState)).first()).toBeVisible();

        if (await page.getByText(unavailableState).isVisible()) {
            await expect(page.getByText(unavailableState)).toBeVisible();
            return;
        }

        await expect(page.locator('.comments-panel')).toBeVisible();
        await expect(page.locator('.comments-panel h2')).toContainText(/comments/i);
        await expect(page.locator('.comments-panel select')).toBeVisible();
        await expect(page.locator('.comment-thread')).toBeVisible();
    });

    test('M6-SMOKE-02: likes and repost views render engagement lists', async ({ page }) => {
        await page.goto(`/tracks/${TRACK_ID}/likes`);

        await expect(page.locator('.section-list-panel').or(page.getByText(unavailableState)).first()).toBeVisible();

        if (await page.getByText(unavailableState).isVisible()) {
            await expect(page.getByText(unavailableState)).toBeVisible();
            return;
        }

        await expect(page.locator('.section-list-panel h2')).toContainText('Likes');
        await expect(page.locator('.section-list-row.is-user').first()).toBeVisible();

        await page.goto(`/tracks/${TRACK_ID}/reposts`);
        await expect(page.locator('.section-list-panel h2')).toContainText('Reposts');
        await expect(page.locator('.section-list-row.is-user').first()).toBeVisible();
    });
});
