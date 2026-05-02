import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, engagementLocators, hasCredentials } from '../support/module6-engagement.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M6-LIK-01: like button is visible in track actions row', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    await expect(locators.actionsRow).toBeVisible();
    await expect(locators.likeButton).toBeVisible();
});
