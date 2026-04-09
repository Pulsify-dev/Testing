import { test, expect } from '@playwright/test';
import { AuthSelectors } from '../../../support/selectors.js';

test('TC-AUTH-LOGIN-07: invalid credentials keep user on login with an error', async ({ page }) => {
  await page.goto('/login');
  await page.fill(AuthSelectors.emailInput, 'does-not-exist@example.com');
  await page.fill(AuthSelectors.passwordInput, 'wrongPassword123!');
  await page.click(AuthSelectors.loginButton);

  await expect(page).toHaveURL(/.*\/login/);
  await expect(page.locator(AuthSelectors.errorMessage)).toBeVisible();
});
