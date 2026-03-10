import { test, expect } from '@playwright/test';
import { Auth } from '../../fixtures/locators';

/**
 * Module 1 — Auth: Login flow
 * Run:  npx playwright test --grep @auth
 */

test.describe('Login Page @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders all required login fields', async ({ page }) => {
    await expect(page.locator(Auth.loginPage.emailInput)).toBeVisible();
    await expect(page.locator(Auth.loginPage.passwordInput)).toBeVisible();
    await expect(page.locator(Auth.loginPage.submitButton)).toBeVisible();
    await expect(page.locator(Auth.loginPage.forgotPasswordLink)).toBeVisible();
    await expect(page.locator(Auth.loginPage.registerLink)).toBeVisible();
  });

  test('shows error banner on invalid credentials', async ({ page }) => {
    await page.locator(Auth.loginPage.emailInput).fill('invalid@example.com');
    await page.locator(Auth.loginPage.passwordInput).fill('wrongpassword');
    await page.locator(Auth.loginPage.submitButton).click();

    await expect(page.locator(Auth.loginPage.errorBanner)).toBeVisible();
  });

  test('navigates to registration page via register link', async ({ page }) => {
    await page.locator(Auth.loginPage.registerLink).click();
    await expect(page).toHaveURL('/register');
  });

  test('navigates to forgot-password page', async ({ page }) => {
    await page.locator(Auth.loginPage.forgotPasswordLink).click();
    await expect(page).toHaveURL('/forgot-password');
  });
});

test.describe('Login — successful authentication @auth', () => {
  test('redirects to home after valid login', async ({ page }) => {
    await page.goto('/login');

    const email    = process.env['TEST_USER_EMAIL']    ?? 'test@pulsify.dev';
    const password = process.env['TEST_USER_PASSWORD'] ?? 'Test@1234';
    await page.locator(Auth.loginPage.emailInput).fill(email);
    await page.locator(Auth.loginPage.passwordInput).fill(password);
    await page.locator(Auth.loginPage.submitButton).click();

    // After login the user should land on the home/dashboard route
    await expect(page).toHaveURL(/\/(home|dashboard|feed)?$/);
    await expect(page.locator(Auth.shared.userAvatarMenu)).toBeVisible();
  });
});
