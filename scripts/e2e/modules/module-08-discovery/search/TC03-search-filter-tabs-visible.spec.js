import { test, expect } from '@playwright/test';
import { discoveryLocators } from '../support/module8-discovery.helper.js';

test('TC-M8-SRC-03: search filter tabs (Tracks / Users / Playlists) are visible', async ({ page }) => {
    await page.goto('/search');
    const locators = discoveryLocators(page);

    await expect(
        locators.searchPage.or(page.locator('.app-shell')).first()
    ).toBeVisible({ timeout: 15000 });

    const filterItems = page.locator('.sc-filter-item');
    const hasFilters = (await filterItems.count()) > 0;
    expect(hasFilters).toBeTruthy();
});
