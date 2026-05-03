import { test, expect } from '@playwright/test';
import { AccountRecoverySelectors } from '../../../support/selectors.js';

test('TC-AUTH-RECOVERY-02: invalid email is rejected at form layer', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.fill(AccountRecoverySelectors.emailInput, 'not-an-email');
  await page.click(AccountRecoverySelectors.submitButton);

  const isValid = await page
    .locator(AccountRecoverySelectors.emailInput)
    .evaluate((input) => input.checkValidity());

  expect(isValid).toBeFalsy();
});
