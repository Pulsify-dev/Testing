import { test, expect } from '@playwright/test';
import { RegisterSelectors } from '../../../support/selectors.js';

test('TC-AUTH-REGISTER-02: password policy blocks short passwords', async ({ page }) => {
  await page.goto('/register');
  await page.fill(RegisterSelectors.usernameInput, 'valid_usr');
  await page.fill(RegisterSelectors.emailInput, 'tester@example.com');
  await page.fill(RegisterSelectors.passwordInput, '123');
  await page.check(RegisterSelectors.termsCheckbox);

  await expect(page.locator(RegisterSelectors.submitButton)).toBeDisabled();
  await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
});
