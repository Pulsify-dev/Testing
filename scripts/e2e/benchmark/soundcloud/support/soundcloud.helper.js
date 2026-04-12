import { expect } from '@playwright/test';

const DEFAULT_TRACK_URL = 'https://soundcloud.com/forss/flickermood';

export function soundCloudEnv() {
    return {
        trackUrl: process.env.SOUNDCLOUD_TRACK_URL || DEFAULT_TRACK_URL,
    };
}

async function clickIfPresent(page, selector) {
    const target = page.locator(selector).first();
    if ((await target.count()) === 0) return false;

    try {
        await target.click({ timeout: 1500 });
        return true;
    } catch {
        return false;
    }
}

export async function dismissSoundCloudModals(page) {
    const cookieSelectors = [
        '#onetrust-accept-btn-handler',
        '#onetrust-pc-btn-handler',
        '#onetrust-close-btn-container button',
        'button.onetrust-close-btn-handler',
        'button:has-text("Accept all")',
        'button:has-text("Accept")',
        'button:has-text("I agree")',
        'button:has-text("Got it")',
    ];

    for (const selector of cookieSelectors) {
        await clickIfPresent(page, selector);
    }

    const closeSelectors = [
        'button[aria-label="Close"]',
        'button:has-text("Close")',
        '.auth-modal button:has-text("Close")',
        '.auth-modal button:has-text("Maybe later")',
    ];

    for (const selector of closeSelectors) {
        await clickIfPresent(page, selector);
    }

    try {
        await page.keyboard.press('Escape');
    } catch {

    }
}

export async function gotoSoundCloudTrack(page) {
    const { trackUrl } = soundCloudEnv();

    await page.goto(trackUrl, { waitUntil: 'domcontentloaded' });
    await dismissSoundCloudModals(page);

    await expect(page).toHaveURL(/soundcloud\.com/i);
    await expect(page).toHaveTitle(/soundcloud/i);

    return trackUrl;
}

export async function waitForTrackSurface(page) {
    await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 30000 });
}
