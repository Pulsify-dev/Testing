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

export async function openSoundCloudTrackBenchmark(page) {
    await gotoSoundCloudTrack(page);
    await waitForTrackSurface(page);
    await dismissSoundCloudModals(page);
}

export function module4TrackLocators(page) {
    return {
        title: page.locator('h1').first(),
        playButton: page.locator(
            'button[aria-label*="Play" i], button[title*="Play" i], .playButton',
        ).first(),
        pauseSignals: page.locator(
            'button[aria-label*="Pause" i], button[title*="Pause" i], .pauseButton',
        ),
        authGateSignals: page.locator('.auth-modal, .modalWhiteout, [id^="overlay_"]'),
        waveformSignals: page.locator(
            '.waveform, .seekBar, [class*="playbackTimeline"], [aria-label*="Seek" i], [role="slider"]',
        ),
        creatorSignals: page.locator(
            '.soundTitle__username, .soundTitle__usernameText, [itemprop="byArtist"]',
        ),
        metadataSignals: page.locator(
            ':text-matches("plays|likes|reposts|comment|duration", "i"), [class*="playbackTimeline__duration"], [class*="sc-minutes"]',
        ),
        unavailableSignals: page.locator(':text-matches("not found|removed|unavailable", "i")'),
    };
}
