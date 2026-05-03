import { test, expect } from '@playwright/test';

test('TC-M2-ACCESS-01: /profile is protected and redirects guests', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/(login|unauthorized)/);
});
