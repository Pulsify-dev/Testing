import { test, expect } from '@playwright/test';
import { module8Env } from '../support/module8-discovery.helper.js';

test('TC-M8-RES-01: resource resolver wildcard route handles unknown paths gracefully', async ({ page }) => {
    await page.goto('/some-unknown-permalink-path');
    await page.waitForTimeout(3000);

    // Resolver may redirect, show 404, or render the track/profile it resolved to
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);
    // Should never show a blank crash
    const jsErrors = [];
    page.on('pageerror', (e) => jsErrors.push(e.message));
    await page.waitForTimeout(500);
    expect(jsErrors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});
