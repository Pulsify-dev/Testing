import { test, expect } from '@playwright/test';
import { loginAndOpenHome, moderationLocators, hasCredentials } from '../support/module11-moderation.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M11-REP-03: submitting a report from a track card produces confirmation or closes modal', async ({ page }) => {
    await loginAndOpenHome(page);
    const locators = moderationLocators(page);

    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 15000 });

    // Target track card images inside the carousel row (avoids logo/avatar)
    const trackCard = page.locator('.sc-carousel-row img').first();
    await expect(trackCard).toBeVisible({ timeout: 15000 });
    await trackCard.scrollIntoViewIfNeeded();
    const box = await trackCard.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(800);

    const flagBtn = page.locator(
        '[aria-label*="report" i], [title*="report" i], [class*="flag"], [class*="report"], button[class*="Flag"], svg[class*="flag"]'
    ).first();
    await expect(flagBtn).toBeVisible({ timeout: 5000 });
    await flagBtn.click();
    await page.waitForTimeout(1000);

    await expect(locators.reportModal).toBeVisible({ timeout: 5000 });

    // Select the first non-placeholder option from the reason dropdown
    await expect(locators.reportReasonSelect).toBeVisible({ timeout: 5000 });
    await locators.reportReasonSelect.selectOption({ index: 1 });

    await expect(locators.reportSubmitBtn).toBeVisible({ timeout: 5000 });
    await locators.reportSubmitBtn.click();
    await page.waitForTimeout(1500);

    // Success: exact message shown in the app after submission
    await expect(locators.reportSuccessMsg).toBeVisible({ timeout: 5000 });
});
