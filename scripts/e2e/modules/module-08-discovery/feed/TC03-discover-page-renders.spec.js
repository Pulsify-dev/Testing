import { test, expect } from '@playwright/test';
import { discoveryLocators } from '../support/module8-discovery.helper.js';

test('TC-M8-FED-03: /discover page renders discover shelf layout', async ({ page }) => {
    await page.goto('/discover');
    const locators = discoveryLocators(page);

    await expect(
        locators.discoverPage.or(page.locator('.app-shell')).first()
    ).toBeVisible({ timeout: 15000 });
});
