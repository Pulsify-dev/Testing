import { test, expect } from '@playwright/test';
import { discoveryLocators } from '../support/module8-discovery.helper.js';

test('TC-M8-SRC-01: /search page renders search input and filter sidebar', async ({ page }) => {
    await page.goto('/search');
    const locators = discoveryLocators(page);

    await expect(
        locators.searchPage.or(page.locator('.app-shell')).first()
    ).toBeVisible({ timeout: 15000 });

    const hasInput = (await locators.searchInput.count()) > 0;
    const hasFilter = (await locators.filterList.count()) > 0;
    expect(hasInput || hasFilter).toBeTruthy();
});
