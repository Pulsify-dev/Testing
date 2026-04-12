import { test, expect } from '@playwright/test';
import { AuthSelectors } from '../../../support/selectors.js';

test('TC-M1-L03 | Password required', async ({ page }) => {
  await page.goto('/login');
  await page.fill(AuthSelectors.emailInput, 'tester@example.com');

  await expect(page.locator(AuthSelectors.passwordInput)).toBeVisible();
  await expect(page.locator(AuthSelectors.loginButton)).toBeDisabled();
});
