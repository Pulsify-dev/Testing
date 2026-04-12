import { test, expect } from '@playwright/test';
import { gotoSoundCloudTrack, waitForTrackSurface } from '../support/soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 6 (Engagement)', () => {
  test('SC-M6-01: like/repost/share actions and comment signals are visible', async ({ page }) => {
    await gotoSoundCloudTrack(page);
    await waitForTrackSurface(page);

    const actionCandidates = page.locator([
      'button:has-text("Like")',
      'button:has-text("Repost")',
      'button:has-text("Share")',
      'a:has-text("Like")',
      'a:has-text("Repost")',
      'a:has-text("Share")',
    ].join(', '));

    expect(await actionCandidates.count()).toBeGreaterThan(0);

    const commentSignals = page.locator(':text-matches("comment", "i")');
    expect(await commentSignals.count()).toBeGreaterThan(0);
  });
});
