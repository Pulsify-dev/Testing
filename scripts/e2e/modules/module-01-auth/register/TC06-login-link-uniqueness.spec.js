import { test, expect } from '@playwright/test';
import { RegisterSelectors } from '../../../support/selectors.js';

test('TC-AUTH-REGISTER-06: register page exposes only one login link', async ({ page }) => {
  await page.goto('/register');
  await expect(page.locator(RegisterSelectors.signInLinks)).toHaveCount(1);
});
