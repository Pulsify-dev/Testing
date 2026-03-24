import { test, expect } from '@playwright/test';
import { RegisterSelectors } from './selectors';

test.describe('Module 1: Registration', () => {

  test('TC-REG-01: Shows error when all fields are empty', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    await page.locator(RegisterSelectors.submitButton).click();
    const errorMsg = page.locator(RegisterSelectors.errorMessage);
    await expect(errorMsg).toBeVisible();
  });

  test('TC-REG-02: Shows error when password is shorter than 6 characters', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    await page.locator(RegisterSelectors.emailInput).fill('test@test.com');
    await page.locator(RegisterSelectors.passwordInput).fill('abc');        // too short
    await page.locator(RegisterSelectors.confirmPasswordInput).fill('abc');
    await page.locator(RegisterSelectors.displayNameInput).fill('testuser');
    await page.locator(RegisterSelectors.termsCheckbox).check();
    await page.locator(RegisterSelectors.submitButton).click();
    const errorMsg = page.locator(RegisterSelectors.errorMessage);
    await expect(errorMsg).toBeVisible();
  });

  test('TC-REG-03: Shows error when passwords do not match', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    await page.locator(RegisterSelectors.emailInput).fill('test@test.com');
    await page.locator(RegisterSelectors.passwordInput).fill('secret123');
    await page.locator(RegisterSelectors.confirmPasswordInput).fill('different123');
    await page.locator(RegisterSelectors.displayNameInput).fill('testuser');
    await page.locator(RegisterSelectors.termsCheckbox).check();
    await page.locator(RegisterSelectors.submitButton).click();
    const errorMsg = page.locator(RegisterSelectors.errorMessage);
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Passwords do not match');
  });

  test('TC-REG-04: Blocks submission when terms checkbox is unchecked', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    await page.locator(RegisterSelectors.emailInput).fill('test@test.com');
    await page.locator(RegisterSelectors.passwordInput).fill('secret123');
    await page.locator(RegisterSelectors.confirmPasswordInput).fill('secret123');
    await page.locator(RegisterSelectors.displayNameInput).fill('testuser');
    await page.locator(RegisterSelectors.submitButton).click();
    const stillOnRegister = page.url().includes('/register');
    const hasError = await page.locator(RegisterSelectors.errorMessage).isVisible();
    expect(stillOnRegister || hasError).toBeTruthy();
  });

  test('TC-REG-05: [BUG] Redirects after successful valid registration', async ({ page }) => {
    test.fail();
    await page.goto('http://localhost:5173/register');
    const uniqueEmail = `testuser_14152@test.com`;
    await page.locator(RegisterSelectors.emailInput).fill(uniqueEmail);
    await page.locator(RegisterSelectors.passwordInput).fill('validPass123');
    await page.locator(RegisterSelectors.confirmPasswordInput).fill('validPass123');
    await page.locator(RegisterSelectors.displayNameInput).fill('Test User');
    await page.locator(RegisterSelectors.termsCheckbox).check();
    await page.locator(RegisterSelectors.submitButton).click();
    await expect(page).not.toHaveURL(/.*\/register/);
  });

  test('TC-REG-06: [BUG] "Sign in" link navigates back to /login', async ({ page }) => {
    test.fail();
    await page.goto('http://localhost:5173/register');
    await page.locator(RegisterSelectors.signInLink).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

});
