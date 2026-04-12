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

export async function openSoundCloudEngagementBenchmark(page) {
    await gotoSoundCloudTrack(page);
    await waitForTrackSurface(page);
    await dismissSoundCloudModals(page);
}

export function module6EngagementLocators(page) {
    return {
        likeActions: page.locator(
            [
                'button[aria-label*="Like" i]',
                'button[title*="Like" i]',
                'button:has-text("Like")',
                'a[aria-label*="Like" i]',
                'a:has-text("Like")',
            ].join(', '),
        ),
        repostActions: page.locator(
            [
                'button[aria-label*="Repost" i]',
                'button[title*="Repost" i]',
                'button:has-text("Repost")',
                'a[aria-label*="Repost" i]',
                'a:has-text("Repost")',
            ].join(', '),
        ),
        shareActions: page.locator(
            [
                'button[aria-label*="Share" i]',
                'button[title*="Share" i]',
                'button:has-text("Share")',
                'a[aria-label*="Share" i]',
                'a:has-text("Share")',
            ].join(', '),
        ),
        commentSignals: page.locator(
            [
                'textarea[placeholder*="comment" i]',
                'input[placeholder*="comment" i]',
                'button:has-text("Comment")',
                'a:has-text("Comment")',
                ':text-matches("comment", "i")',
            ].join(', '),
        ),
        timestampSignals: page.locator(
            [
                '[class*="waveform"]',
                '[class*="commentMarker"]',
                '[class*="playbackTimeline"]',
                '[aria-label*="Seek" i]',
                '[role="slider"]',
                String.raw`:text-matches("(^|\s)\d{1,2}:\d{2}(\s|$)", "i")`,
            ].join(', '),
        ),
        engagementCountSignals: page.locator(
            [
                ':text-matches("likes?|reposts?|comments?", "i")',
                'a[href*="/likes"]',
                'a[href*="/reposts"]',
            ].join(', '),
        ),
        engagementListSignals: page.locator(
            [
                'a[href*="/likes"]',
                'a[href*="/reposts"]',
                'button:has-text("Likes")',
                'button:has-text("Reposts")',
                ':text-matches("liked by|reposted by|likes|reposts", "i")',
            ].join(', '),
        ),
        authGateSignals: page.locator('.auth-modal, .modalWhiteout, [id^="overlay_"]'),
    };
}
