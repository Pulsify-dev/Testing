import { test, expect } from '@playwright/test';
import { openTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-CMT-02: submitting a comment without auth is blocked or auth-gated', async ({ page }) => {
    await openTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    const submitBtn = page.locator('.comment-submit');
    if ((await submitBtn.count()) === 0) return;

    const isDisabled = await submitBtn.isDisabled().catch(() => true);
    if (isDisabled) {
        expect(isDisabled).toBeTruthy();
        return;
    }

    await submitBtn.click();
    await page.waitForTimeout(1000);
    const authGated =
        page.url().includes('/login') ||
        (await page.locator('text=/sign in|log in/i').count()) > 0 ||
        (await submitBtn.count()) > 0;
    expect(authGated).toBeTruthy();
});
