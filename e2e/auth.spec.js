import { test, expect } from '@playwright/test';
import { AuthSelectors } from './selectors';

test.describe('Module 1: Login', () => {

  test('TC-AUTH-01: Submit button is disabled when email field is empty', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.locator(AuthSelectors.loginButton)).toBeDisabled();
  });

  test('TC-AUTH-02: Shows error when email format is invalid', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.locator(AuthSelectors.emailInput).fill('not-an-email');
    await page.locator(AuthSelectors.loginButton).click();
    const errorMsg = page.locator(AuthSelectors.errorMessage);
    await expect(errorMsg).toBeVisible();
  });

  test('TC-AUTH-03: [BUG] Redirects to home page after successful login', async ({ page }) => {
    test.fail();
    await page.goto('http://localhost:5173/login');
    await page.locator(AuthSelectors.emailInput).fill('test@test.com');
    await page.locator(AuthSelectors.loginButton).click();
    await expect(page).not.toHaveURL(/.*\/login/);
  });

  test('TC-AUTH-04: [Bug] Login page displays "Pulsify" not "SoundCloud"', async ({ page }) => {
    test.fail();
    await page.goto('http://localhost:5173/login');
    const termsText = page.locator(AuthSelectors.termsText);
    await expect(termsText).not.toContainText('SoundCloud');
    await expect(termsText).toContainText('Pulsify');
  });

  test('TC-AUTH-05: "Create account" link navigates to /register', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.locator(AuthSelectors.createAccountLink).click();

    await expect(page).toHaveURL(/.*\/register/);
  });

});
