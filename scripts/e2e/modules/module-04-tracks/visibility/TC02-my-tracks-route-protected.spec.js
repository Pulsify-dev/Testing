import { test, expect } from '@playwright/test';

test('TC-M4-VIS-02: unauthenticated user cannot access /my-tracks', async ({ page }) => {
    await page.goto('/my-tracks');
    await expect(page).not.toHaveURL(/\/my-tracks$/);
});
