import { test, expect } from '@playwright/test';
import { AuthSelectors } from '../../../support/selectors.js';

test('TC-M1-L01 | Empty email disabled', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator(AuthSelectors.loginButton)).toBeDisabled();
});
