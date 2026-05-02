import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, moderationLocators, hasCredentials } from '../support/module11-moderation.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M11-REP-03: submitting a report produces a confirmation or closes the modal', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = moderationLocators(page);

    await expect(page.locator('.track-hero')).toBeVisible({ timeout: 20000 });

    const moreBtn = page.locator('button, [role="button"]').filter({ hasText: /more|options|\.\.\./i }).first();
    if ((await moreBtn.count()) > 0) {
        await moreBtn.click();
        await page.waitForTimeout(500);
    }

    await expect(locators.reportBtn).toBeVisible({ timeout: 10000 });
    await locators.reportBtn.click();
    await page.waitForTimeout(1000);

    await expect(locators.reportModal).toBeVisible({ timeout: 5000 });

    // Select the first available reason
    const firstOption = locators.reportReasonOptions.first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    await expect(locators.reportSubmitBtn).toBeVisible({ timeout: 5000 });
    await locators.reportSubmitBtn.click();
    await page.waitForTimeout(1500);

    // After submit: modal closes OR a success/thank-you message appears
    const modalGone = (await locators.reportModal.count()) === 0;
    const hasConfirmation = (await page.locator('text=/thank you|report received|submitted/i').count()) > 0;
    expect(modalGone || hasConfirmation).toBeTruthy();
});
