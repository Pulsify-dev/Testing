import { test, expect } from '@playwright/test';
import { RegisterSelectors } from '../../../support/selectors.js';

test('TC-AUTH-REGISTER-01: submit is disabled when required fields are empty', async ({ page }) => {
  await page.goto('/register');
  await expect(page.locator(RegisterSelectors.submitButton)).toBeDisabled();
});
