import { test, expect } from '@playwright/test';
import { AuthSelectors } from '../../../support/selectors.js';

test('TC-AUTH-LOGIN-05: create account action navigates to register page', async ({ page }) => {
  await page.goto('/login');
  await page.click(AuthSelectors.createAccountLink);

  await expect(page).toHaveURL(/.*\/register/);
});
