import { test, expect } from '@playwright/test';
import { discoveryLocators } from '../support/module8-discovery.helper.js';

test('TC-M8-TRD-02: trending page shows genre tabs', async ({ page }) => {
    await page.goto('/trending');
    const locators = discoveryLocators(page);

    await expect(
        locators.chartsPage.or(page.locator('.app-shell')).first()
    ).toBeVisible({ timeout: 15000 });

    const hasTabs = (await locators.genreTabs.count()) > 0;
    expect(hasTabs).toBeTruthy();
});
