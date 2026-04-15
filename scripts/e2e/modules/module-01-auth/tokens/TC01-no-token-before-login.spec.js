import { test, expect } from '@playwright/test';
import {
  clearAuthStorage,
  readAuthStorage,
} from '../support/module1-auth.helper.js';

test('TC-M1-T01 | No tokens before login', async ({ page }) => {
  await page.goto('/login');
  await clearAuthStorage(page);
  await page.reload();

  const authStorage = await readAuthStorage(page);
  expect(authStorage.accessToken).toBeNull();
  expect(authStorage.refreshToken).toBeNull();
});
