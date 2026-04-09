import { test, expect } from '@playwright/test';

test('TC-M1-V02 | invalid token query still loads login', async ({ page }) => {
  await page.goto('/login?error=invalid_token');
  await expect(page).toHaveURL(/\/login\?error=invalid_token/);
  await expect(page.locator('h1')).toContainText(/Sign in/i);
});
