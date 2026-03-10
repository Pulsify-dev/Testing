import { test, expect } from '@playwright/test';
import { Playback } from '../../fixtures/locators';

/**
 * Module 5 — Playback: player bar and queue
 * Run:  npx playwright test --grep @playback
 *
 * These tests assume the user is already authenticated.
 * A shared `storageState` fixture with a saved auth session should
 * be configured in playwright.config.ts for full CI runs.
 */

test.describe('Player Bar @playback', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to any authenticated page where the player bar is visible
    await page.goto('/home');
  });

  test('player bar controls are visible', async ({ page }) => {
    await expect(page.locator(Playback.playerBar.playPauseButton)).toBeVisible();
    await expect(page.locator(Playback.playerBar.skipNextButton)).toBeVisible();
    await expect(page.locator(Playback.playerBar.skipPrevButton)).toBeVisible();
    await expect(page.locator(Playback.playerBar.progressBar)).toBeVisible();
    await expect(page.locator(Playback.playerBar.volumeSlider)).toBeVisible();
  });

  test('play/pause button toggles playback state', async ({ page }) => {
    const playPause = page.locator(Playback.playerBar.playPauseButton);
    const initialAriaLabel = await playPause.getAttribute('aria-label');

    await playPause.click();
    await expect(playPause).not.toHaveAttribute('aria-label', initialAriaLabel ?? '');
  });

  test('mute button toggles mute state', async ({ page }) => {
    const muteBtn = page.locator(Playback.playerBar.muteButton);
    await muteBtn.click();
    await expect(muteBtn).toHaveAttribute('aria-pressed', 'true');

    await muteBtn.click();
    await expect(muteBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('shuffle button toggles shuffle state', async ({ page }) => {
    const shuffleBtn = page.locator(Playback.playerBar.shuffleButton);
    await shuffleBtn.click();
    await expect(shuffleBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('skip next advances to the next track', async ({ page }) => {
    const currentTitle = await page.locator(Playback.playerBar.trackTitle).textContent();
    await page.locator(Playback.playerBar.skipNextButton).click();

    // Give the player a moment to update
    await page.waitForTimeout(500);
    const newTitle = await page.locator(Playback.playerBar.trackTitle).textContent();
    expect(newTitle).not.toBe(currentTitle);
  });

  test('displays current track info', async ({ page }) => {
    await expect(page.locator(Playback.playerBar.trackTitle)).not.toBeEmpty();
    await expect(page.locator(Playback.playerBar.trackArtist)).not.toBeEmpty();
    await expect(page.locator(Playback.playerBar.albumArt)).toBeVisible();
  });
});

test.describe('Queue Panel @playback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home');
    // Open the queue panel
    await page.locator(Playback.playerBar.queueButton).click();
    await expect(page.locator(Playback.queuePanel.queuePanel)).toBeVisible();
  });

  test('queue panel opens and shows tracks', async ({ page }) => {
    await expect(page.locator(Playback.queuePanel.queueHeading)).toBeVisible();
    const items = page.locator(Playback.queuePanel.queueItems);
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('can remove a track from the queue', async ({ page }) => {
    const items = page.locator(Playback.queuePanel.queueItems);
    const initialCount = await items.count();

    await items.first().locator(Playback.queuePanel.queueItemRemoveBtn).click();
    await expect(items).toHaveCount(initialCount - 1);
  });

  test('can close the queue panel', async ({ page }) => {
    await page.locator(Playback.queuePanel.queueCloseButton).click();
    await expect(page.locator(Playback.queuePanel.queuePanel)).not.toBeVisible();
  });
});

test.describe('Full-screen Player @playback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home');
    await page.locator(Playback.playerBar.expandPlayerButton).click();
    await expect(page).toHaveURL(/\/player/);
  });

  test('full-screen player shows large album art and track info', async ({ page }) => {
    await expect(page.locator(Playback.fullscreenPlayer.albumArtLarge)).toBeVisible();
    await expect(page.locator(Playback.fullscreenPlayer.trackTitle)).not.toBeEmpty();
    await expect(page.locator(Playback.fullscreenPlayer.trackArtist)).not.toBeEmpty();
  });

  test('close button collapses back to player bar', async ({ page }) => {
    await page.locator(Playback.fullscreenPlayer.closeButton).click();
    await expect(page).not.toHaveURL(/\/player/);
    await expect(page.locator(Playback.playerBar.playPauseButton)).toBeVisible();
  });
});
