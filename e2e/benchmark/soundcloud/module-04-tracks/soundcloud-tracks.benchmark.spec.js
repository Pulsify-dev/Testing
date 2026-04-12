import { test, expect } from '@playwright/test';
import { gotoSoundCloudTrack, waitForTrackSurface } from '../support/soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 4 (Tracks)', () => {
  test('SC-M4-01: public track page loads with title and playable surface', async ({ page }) => {
    await gotoSoundCloudTrack(page);
    await waitForTrackSurface(page);

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20000 });

    const playControls = page.locator(
      'button[aria-label*="Play" i], button[title*="Play" i], .playButton',
    );

    expect(await playControls.count()).toBeGreaterThan(0);
  });
});
