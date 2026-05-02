import { test, expect } from '@playwright/test';

test('TC-M9-DM-01: unauthenticated user cannot access /messages', async ({ page }) => {
    await page.goto('/messages');
    await expect(page).not.toHaveURL(/\/messages$/);
});
