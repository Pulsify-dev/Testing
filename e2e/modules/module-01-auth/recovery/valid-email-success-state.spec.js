import { test, expect } from '@playwright/test';
import { AccountRecoverySelectors } from '../../../support/selectors.js';

test('TC-AUTH-RECOVERY-03: valid email submission shows success state', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.fill(AccountRecoverySelectors.emailInput, 'test@test.com');
  await page.click(AccountRecoverySelectors.submitButton);

  await expect(page.locator(AccountRecoverySelectors.successMessage)).toBeVisible();
});
