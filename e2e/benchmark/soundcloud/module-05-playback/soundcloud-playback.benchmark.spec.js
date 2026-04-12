import { test, expect } from '@playwright/test';
import {
  dismissSoundCloudModals,
  gotoSoundCloudTrack,
  waitForTrackSurface,
} from '../support/soundcloud.helper.js';

test.describe('SoundCloud Benchmark - Module 5 (Playback)', () => {
  test('SC-M5-01: play control is interactable on a public track', async ({ page }) => {
    await gotoSoundCloudTrack(page);
    await waitForTrackSurface(page);

    const playButton = page
      .locator('button[aria-label*="Play" i], button[title*="Play" i], .playButton')
      .first();

    await expect(playButton).toBeVisible({ timeout: 20000 });
    await dismissSoundCloudModals(page);

    try {
      await playButton.click({ timeout: 5000 });
    } catch {
      await dismissSoundCloudModals(page);
      await playButton.click({ force: true, timeout: 5000 });
    }

    const pauseSignals = page.locator(
      'button[aria-label*="Pause" i], button[title*="Pause" i], .pauseButton',
    );
    const authGateSignals = page.locator('.auth-modal, .modalWhiteout, [id^="overlay_"]');

    await page.waitForTimeout(1200);
    const hasPauseSignal = (await pauseSignals.count()) > 0;
    const hasAuthGateSignal = (await authGateSignals.count()) > 0;
    expect(hasPauseSignal || hasAuthGateSignal).toBeTruthy();
  });
});
