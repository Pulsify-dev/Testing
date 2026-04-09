import { test, expect } from '@playwright/test';
import { AccountRecoverySelectors } from './selectors';

test.describe('Module 1: Password Recovery (Blackbox)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('TC-REC-01: Submit button is disabled when email field is empty', async ({ page }) => {
    await expect(page.locator(AccountRecoverySelectors.submitButton)).toBeDisabled();
  });

  test('TC-REC-02: Invalid email is rejected at the form layer', async ({ page }) => {
    await page.locator(AccountRecoverySelectors.emailInput).fill('not-an-email');
    await page.locator(AccountRecoverySelectors.submitButton).click();

    const emailIsValid = await page
      .locator(AccountRecoverySelectors.emailInput)
      .evaluate((input) => input.checkValidity());
    expect(emailIsValid).toBeFalsy();
  });

  test('TC-REC-03: Shows success state when a valid email is submitted', async ({ page }) => {
    await page.locator(AccountRecoverySelectors.emailInput).fill('test@test.com');
    await page.locator(AccountRecoverySelectors.submitButton).click();
    const successMsg = page.locator(AccountRecoverySelectors.successMessage);
    await expect(successMsg).toBeVisible();
    await expect(successMsg).toContainText('Check your email');
  });

  test('TC-REC-04: Page contains only one login navigation link', async ({ page }) => {
    await expect(page.locator('a[href="/login"]')).toHaveCount(1);
  });

  test('TC-REC-05: "Back to login" navigation lands on /login', async ({ page }) => {
    await page.locator(AccountRecoverySelectors.backToLoginLink).click();
    await expect(page).toHaveURL(/.*\/login/);
  });
});