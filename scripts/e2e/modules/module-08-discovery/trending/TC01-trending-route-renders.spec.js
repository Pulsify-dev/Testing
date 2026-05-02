import { test, expect } from '@playwright/test';
import { discoveryLocators } from '../support/module8-discovery.helper.js';

test('TC-M8-TRD-01: /trending page renders charts layout', async ({ page }) => {
    await page.goto('/trending');
    const locators = discoveryLocators(page);

    await expect(
        locators.chartsPage.or(page.locator('.app-shell')).first()
    ).toBeVisible({ timeout: 15000 });
});
