import { test, expect } from '@playwright/test';

test('TC-M1-V03 | missing token query still loads login', async ({ page }) => {
  await page.goto('/login?error=missing_token');
  await expect(page).toHaveURL(/\/login\?error=missing_token/);
  await expect(page.locator('h1')).toContainText(/Sign in/i);
});
