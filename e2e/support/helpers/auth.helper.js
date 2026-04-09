import { expect } from '@playwright/test';

export async function loginViaUi(page, email, password) {
  await page.goto('/login');
  await page.fill('input[placeholder="Email address"]', email);
  await page.fill('input[placeholder="Password"]', password);
  await page.click('button:has-text("Sign in")');
  await expect(page).toHaveURL(/\/(home|feed|discover|profile|tracks)/);
}
