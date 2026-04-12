import {
    dismissSoundCloudModals,
    gotoSoundCloudTrack,
    waitForTrackSurface,
} from '../../support/soundcloud.helper.js';

export {
    dismissSoundCloudModals,
    gotoSoundCloudTrack,
    waitForTrackSurface,
} from '../../support/soundcloud.helper.js';

export async function openSoundCloudPlaybackBenchmark(page) {
    await gotoSoundCloudTrack(page);
    await waitForTrackSurface(page);
    await dismissSoundCloudModals(page);
}

export function module5PlaybackLocators(page) {
    return {
        playButton: page
            .locator('button[aria-label*="Play" i], button[title*="Play" i], .playButton')
            .first(),
        pauseSignals: page.locator(
            'button[aria-label*="Pause" i], button[title*="Pause" i], .pauseButton',
        ),
        authGateSignals: page.locator('.auth-modal, .modalWhiteout, [id^="overlay_"]'),
        seekSignals: page.locator(
            '.waveform, .seekBar, [class*="playbackTimeline"], [aria-label*="Seek" i], [role="slider"]',
        ),
        volumeSignals: page.locator(
            'button[aria-label*="Volume" i], button[aria-label*="Mute" i], [class*="volume"]',
        ),
        timeSignals: page.locator(
            '[class*="playbackTimeline__duration"], [class*="playbackTimeline__timePassed"], [class*="duration"]',
        ),
        stickyPlayerSignals: page.locator(
            '.playControls, .globalPlayer, [class*="playControls"], [class*="playbackSoundBadge"]',
        ),
    };
}

export async function tryStartPlayback(page) {
    const locators = module5PlaybackLocators(page);

    try {
        await locators.playButton.click({ timeout: 5000 });
    } catch {
        await dismissSoundCloudModals(page);
        await locators.playButton.click({ force: true, timeout: 5000 });
    }

    await page.waitForTimeout(1200);

    if ((await locators.pauseSignals.count()) > 0) return 'playing';
    if ((await locators.authGateSignals.count()) > 0) return 'auth-gate';
    return 'unknown';
}
