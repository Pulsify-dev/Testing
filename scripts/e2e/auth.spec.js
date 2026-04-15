import { test, expect } from '@playwright/test';
import { AuthSelectors } from './selectors';

test.describe('Module 1: Login (Blackbox)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('TC-AUTH-01: Submit button is disabled when email field is empty', async ({ page }) => {
    await expect(page.locator(AuthSelectors.loginButton)).toBeDisabled();
  });

  test('TC-AUTH-02: Invalid email is rejected at the form layer', async ({ page }) => {
    await page.locator(AuthSelectors.emailInput).fill('not-an-email');
    await page.locator(AuthSelectors.passwordInput).fill('anyPassword123');
    await page.locator(AuthSelectors.loginButton).click();

    const emailIsValid = await page
      .locator(AuthSelectors.emailInput)
      .evaluate((input) => input.checkValidity());
    expect(emailIsValid).toBeFalsy();
  });

  test('TC-AUTH-03: Password is required for login flow', async ({ page }) => {
    await page.locator(AuthSelectors.emailInput).fill('tester@example.com');

    await expect(page.locator(AuthSelectors.passwordInput)).toBeVisible();
    await expect(page.locator(AuthSelectors.loginButton)).toBeDisabled();
  });

  test('TC-AUTH-04: Login legal text uses Pulsify branding', async ({ page }) => {
    const termsText = page.locator(AuthSelectors.termsText);
    const navbarBrand = page.locator(AuthSelectors.navbarBrand);
    await expect(termsText).not.toContainText('SoundCloud');
    await expect(termsText).toContainText('Pulsify');
    await expect(navbarBrand).not.toContainText('SoundCloud');
    await expect(navbarBrand).toContainText('Pulsify');
  });

  test('TC-AUTH-05: "Create account" link navigates to /register', async ({ page }) => {
    await page.locator(AuthSelectors.createAccountLink).click();
    await expect(page).toHaveURL(/.*\/register/);
  });
});
