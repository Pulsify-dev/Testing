import { test, expect } from '@playwright/test';
import { AccountRecoverySelectors } from './selectors';

test.describe('Module 1: Password Recovery', () => {

  test('TC-REC-01: Submit button is disabled when email field is empty', async ({ page }) => {
    await page.goto('http://localhost:5173/forgot-password');
    await expect(page.locator(AccountRecoverySelectors.submitButton)).toBeDisabled();
  });

  test('TC-REC-02: Shows error when email format is invalid', async ({ page }) => {
    await page.goto('http://localhost:5173/forgot-password');
    await page.locator(AccountRecoverySelectors.emailInput).fill('not-an-email');
    await page.locator(AccountRecoverySelectors.submitButton).click();
    const errorMsg = page.locator(AccountRecoverySelectors.errorMessage);
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Please enter a valid email address');
  });
  test('TC-REC-03: Show error for invalid email format', async ({page})=>{
    await page.goto('http://localhost:5173/forgot-password');
    await page.locator(AccountRecoverySelectors.emailInput).fill('not-an-email');
    await page.locator(AccountRecoverySelectors.submitButton).click();
    const errorMsg = page.locator(AccountRecoverySelectors.errorMessage);
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Please enter a valid email address');
  });

  test('TC-REC-04: Shows success message when a valid email is submitted', async ({ page }) => {
    await page.goto('http://localhost:5173/forgot-password');
    await page.locator(AccountRecoverySelectors.emailInput).fill('test@test.com');
    await page.locator(AccountRecoverySelectors.submitButton).click();
    const successMsg = page.locator(AccountRecoverySelectors.successMessage);
    await expect(successMsg).toBeVisible();
    await expect(successMsg).toContainText('your email');
  });

  test('TC-REC-05: [BUG]"Back to login" link navigates to /login', async ({ page }) => {
    test.fail();
    await page.goto('http://localhost:5173/forgot-password');
    await page.locator(AccountRecoverySelectors.backToLoginLink).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

});