import { test, expect } from '@playwright/test';
import { AuthSelectors } from '../../../support/selectors.js';

test('TC-M1-L02 | Invalid email rejected', async ({ page }) => {
  await page.goto('/login');
  await page.fill(AuthSelectors.emailInput, 'not-an-email');
  await page.fill(AuthSelectors.passwordInput, 'AnyPassword123!');
  await page.click(AuthSelectors.loginButton);

  const isValid = await page
    .locator(AuthSelectors.emailInput)
    .evaluate((input) => input.checkValidity());

  expect(isValid).toBeFalsy();
  await expect(page).toHaveURL(/.*\/login/);
});
