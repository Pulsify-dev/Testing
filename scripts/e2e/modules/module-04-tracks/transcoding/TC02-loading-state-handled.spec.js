import { test, expect } from '@playwright/test';
import { openTrack } from '../support/module4-tracks.helper.js';

test('TC-M4-TRN-02: track page never shows a completely blank screen on load', async ({ page }) => {
    await openTrack(page);

    const shell = page.locator('.app-shell');
    await expect(shell).toBeVisible({ timeout: 10000 });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);
});
