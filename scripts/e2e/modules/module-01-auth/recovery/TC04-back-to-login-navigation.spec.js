import { test, expect } from '@playwright/test';
import { AccountRecoverySelectors } from '../../../support/selectors.js';

test('TC-AUTH-RECOVERY-04: back to login action navigates to /login', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.click(AccountRecoverySelectors.backToLoginLink);

  await expect(page).toHaveURL(/.*\/login/);
});
