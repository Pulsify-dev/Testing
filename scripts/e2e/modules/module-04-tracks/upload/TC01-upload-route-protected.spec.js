import { test, expect } from '@playwright/test';

test('TC-M4-UPL-01: unauthenticated user cannot access /upload', async ({ page }) => {
    await page.goto('/upload');
    await expect(page).not.toHaveURL(/\/upload$/);
});
