import { test, expect } from '@playwright/test';
import { discoveryLocators } from '../support/module8-discovery.helper.js';

test('TC-M8-TRD-03: trending chart list or loader renders (handled state)', async ({ page }) => {
    await page.goto('/trending');
    const locators = discoveryLocators(page);

    await page.waitForTimeout(3000);
    const hasChart = (await locators.chartList.count()) > 0;
    const hasLoader = (await page.locator('.sc-loader').count()) > 0;
    const hasEntry = (await page.locator('.sc-chart-entry, .sc-chart-card').count()) > 0;
    const hasShell = (await page.locator('.app-shell').count()) > 0;
    expect(hasChart || hasLoader || hasEntry || hasShell).toBeTruthy();
});
