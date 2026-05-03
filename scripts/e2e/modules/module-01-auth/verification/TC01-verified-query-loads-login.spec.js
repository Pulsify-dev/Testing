import { test, expect } from '@playwright/test';

test('TC-M1-V01 | verified query opens login page', async ({ page }) => {
  await page.goto('/login?verified=true');
  await expect(page).toHaveURL(/\/login\?verified=true/);
  await expect(page.locator('h1')).toContainText(/Sign in/i);
});
