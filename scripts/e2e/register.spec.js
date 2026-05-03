import { test, expect } from '@playwright/test';
import { RegisterSelectors } from './selectors';

test.describe('Module 1: Registration (Blackbox)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('TC-REG-01: Submit is disabled when required fields are empty', async ({ page }) => {
    await expect(page.locator(RegisterSelectors.submitButton)).toBeDisabled();
  });

  test('TC-REG-02: Password policy blocks short passwords', async ({ page }) => {
    await page.locator(RegisterSelectors.usernameInput).fill('test_user');
    await page.locator(RegisterSelectors.emailInput).fill('tester@example.com');
    await page.locator(RegisterSelectors.passwordInput).fill('abc');
    await page.locator(RegisterSelectors.termsCheckbox).check();
    await expect(page.locator(RegisterSelectors.submitButton)).toBeDisabled();
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('TC-REG-03: Terms checkbox is required before submit can enable', async ({ page }) => {
    await page.locator(RegisterSelectors.usernameInput).fill('test_user');
    await page.locator(RegisterSelectors.emailInput).fill('tester@example.com');
    await page.locator(RegisterSelectors.passwordInput).fill('validPass123');

    await expect(page.locator(RegisterSelectors.submitButton)).toBeDisabled();

    await page.locator(RegisterSelectors.termsCheckbox).check();
    await expect(page.locator(RegisterSelectors.submitButton)).toBeEnabled();
  });

  test('TC-REG-04: Registration page exposes CAPTCHA challenge', async ({ page }) => {
    await expect(page.locator(RegisterSelectors.captchaFrame)).toHaveCount(1);
  });

  test('TC-REG-05: "Sign in" link navigates to /login', async ({ page }) => {
    await page.locator(RegisterSelectors.signInLink).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('TC-REG-06: Page contains only one login navigation link', async ({ page }) => {
    await expect(page.locator('a[href="/login"]')).toHaveCount(1);
  });

});
