import { test, expect } from '@playwright/test';
import { RegisterSelectors } from '../../../support/selectors.js';

test('TC-AUTH-REGISTER-03: terms acceptance is required before submission', async ({ page }) => {
  await page.goto('/register');
  await page.fill(RegisterSelectors.usernameInput, 'valid_usr');
  await page.fill(RegisterSelectors.emailInput, 'tester@example.com');
  await page.fill(RegisterSelectors.passwordInput, 'ValidPassword123!');

  await expect(page.locator(RegisterSelectors.submitButton)).toBeDisabled();
});
