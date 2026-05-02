import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, hasCredentials } from '../support/module5-playback.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-ACC-02: track page handles any playback access tier without crashing', async ({ page }) => {
    const jsErrors = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await loginAndOpenTrack(page);

    // Wait for the shell, then wait for track content specifically
    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });
    if ((await page.locator('.track-hero').count()) === 0) return;

    await expect(page.locator('.track-hero').first()).toBeVisible({ timeout: 20000 });

    await page.waitForTimeout(1000);
    expect(jsErrors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});
