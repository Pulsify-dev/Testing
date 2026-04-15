import { test, expect } from '@playwright/test';
import { RegisterSelectors } from '../../../support/selectors.js';

test('TC-AUTH-REGISTER-05: footer sign in link navigates to login', async ({ page }) => {
  await page.goto('/register');
  await page.click(RegisterSelectors.signInLink);

  await expect(page).toHaveURL(/.*\/login/);
});
