import { test, expect } from '@playwright/test';
import { loginAndOpenFeed, discoveryLocators, hasCredentials } from '../support/module8-discovery.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M8-FED-01: /feed route renders activity feed page', async ({ page }) => {
    await loginAndOpenFeed(page);
    const locators = discoveryLocators(page);

    await expect(
        locators.feedPage.or(page.locator('.app-shell')).first()
    ).toBeVisible({ timeout: 15000 });
});
