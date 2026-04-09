import { test, expect } from '@playwright/test';
import { AccountRecoverySelectors } from '../../../support/selectors.js';

test('TC-AUTH-RECOVERY-01: submit is disabled when email is empty', async ({ page }) => {
  await page.goto('/forgot-password');
  await expect(page.locator(AccountRecoverySelectors.submitButton)).toBeDisabled();
});
