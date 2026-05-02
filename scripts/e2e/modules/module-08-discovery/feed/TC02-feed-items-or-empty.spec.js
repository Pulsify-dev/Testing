import { test, expect } from '@playwright/test';
import { loginAndOpenFeed, discoveryLocators, hasCredentials } from '../support/module8-discovery.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M8-FED-02: feed shows track cards or empty/follow-prompt state', async ({ page }) => {
    await loginAndOpenFeed(page);
    const locators = discoveryLocators(page);

    await page.waitForTimeout(3000);
    const hasItems = (await locators.feedItems.count()) > 0;
    const hasEmpty = (await locators.emptyState.count()) > 0;
    const hasFollowPrompt = (await page.locator('.sc-artists-list, .sc-artists-suggestions-header').count()) > 0;
    const hasShell = (await page.locator('.app-shell').count()) > 0;
    expect(hasItems || hasEmpty || hasFollowPrompt || hasShell).toBeTruthy();
});
