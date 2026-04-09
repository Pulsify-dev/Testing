import { test, expect } from '@playwright/test';
import { AuthSelectors } from '../../../support/selectors.js';

test('TC-AUTH-LOGIN-06: forgot password action navigates to recovery page', async ({ page }) => {
  await page.goto('/login');
  await page.click(AuthSelectors.forgotPasswordLink);

  await expect(page).toHaveURL(/.*\/forgot-password/);
});
