import { test, expect } from '@playwright/test';
import { RegisterSelectors } from '../../../support/selectors.js';

test('TC-AUTH-REGISTER-07: username below minimum length is rejected', async ({ page }) => {
  await page.goto('/register');
  await page.fill(RegisterSelectors.usernameInput, 'abcde');
  await page.fill(RegisterSelectors.emailInput, 'tester@example.com');
  await page.fill(RegisterSelectors.passwordInput, 'ValidPassword123!');
  await page.check(RegisterSelectors.termsCheckbox);

  await expect(page.locator(RegisterSelectors.usernameHintError)).toBeVisible();
  await expect(page.locator(RegisterSelectors.submitButton)).toBeDisabled();
});
