import { test, expect } from '@playwright/test';
import { loginAndOpenTrack, engagementLocators, hasCredentials } from '../support/module6-engagement.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M6-CMT-03: comments panel renders with thread or empty state', async ({ page }) => {
    await loginAndOpenTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    await expect(locators.commentsPanel).toBeVisible();
    const hasComments = (await page.locator('.comment-block, .comment-row').count()) > 0;
    const hasEmpty = (await page.locator('.comment-empty-state').count()) > 0;
    expect(hasComments || hasEmpty).toBeTruthy();
});
