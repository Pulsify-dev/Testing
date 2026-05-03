import { test, expect } from '@playwright/test';
import {
  hasCredentials,
  loginWithCredentials,
} from '../support/module1-auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-AUTH-LOGIN-09: authenticated user is redirected away from /login', async ({ page }) => {
  await loginWithCredentials(page);

  await page.goto('/login');
  await expect(page).toHaveURL(/\/(home|feed|discover|profile|tracks)/);
});
