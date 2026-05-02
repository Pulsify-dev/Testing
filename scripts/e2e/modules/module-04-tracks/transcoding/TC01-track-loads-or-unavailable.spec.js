import { test, expect } from '@playwright/test';
import { openTrack, isTrackLoaded } from '../support/module4-tracks.helper.js';

test('TC-M4-TRN-01: track page loads successfully or shows unavailable state (not blank)', async ({ page }) => {
    await openTrack(page);
    await page.waitForTimeout(3000);
    const handled = await isTrackLoaded(page);
    expect(handled).toBeTruthy();
});
