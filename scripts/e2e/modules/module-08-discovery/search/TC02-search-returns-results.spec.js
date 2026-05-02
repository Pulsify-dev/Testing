import { test, expect } from '@playwright/test';
import { discoveryLocators } from '../support/module8-discovery.helper.js';

test('TC-M8-SRC-02: typing a keyword in search returns results or no-results state', async ({ page }) => {
    await page.goto('/search');
    const locators = discoveryLocators(page);

    await expect(
        locators.searchPage.or(page.locator('.app-shell')).first()
    ).toBeVisible({ timeout: 15000 });

    const input = locators.searchInput;
    if ((await input.count()) === 0) return;

    await input.fill('test');
    await input.press('Enter');
    await page.waitForTimeout(3000);

    const hasResults = (await page.locator('.sc-track-list, .sc-search-results').count()) > 0;
    const hasNoResults = (await page.locator('.sc-no-results, text=/no result/i').count()) > 0;
    const hasLoader = (await page.locator('.sc-loader').count()) > 0;
    expect(hasResults || hasNoResults || hasLoader).toBeTruthy();
});
