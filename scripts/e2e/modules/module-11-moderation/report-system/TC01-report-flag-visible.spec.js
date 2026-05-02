import { test, expect } from '@playwright/test';
import { loginAndOpenHome, moderationLocators, hasCredentials } from '../support/module11-moderation.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M11-REP-01: report flag icon appears when hovering over a track card on home page', async ({ page }) => {
    await loginAndOpenHome(page);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    // Target track card images inside the carousel row (avoids logo/avatar)
    const trackCard = page.locator('.sc-carousel-row img').first();
    await expect(trackCard).toBeVisible({ timeout: 15000 });

    // Scroll into view and move the real mouse cursor to trigger CSS :hover
    await trackCard.scrollIntoViewIfNeeded();
    const box = await trackCard.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(800);

    // Flag/report button appears on hover over the track artwork
    const flagBtn = page.locator(
        '[aria-label*="report" i], [title*="report" i], [class*="flag"], [class*="report"], button[class*="Flag"], svg[class*="flag"]'
    ).first();
    await expect(flagBtn).toBeVisible({ timeout: 5000 });
});
