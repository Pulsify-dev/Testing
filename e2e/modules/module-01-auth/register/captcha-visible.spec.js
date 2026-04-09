import { test, expect } from '@playwright/test';
import { RegisterSelectors } from '../../../support/selectors.js';

test('TC-AUTH-REGISTER-04: CAPTCHA challenge is visible on registration page', async ({ page }) => {
  await page.goto('/register');
  await expect(page.locator(RegisterSelectors.captchaFrame)).toHaveCount(1);
});
