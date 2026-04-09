import { test, expect } from '@playwright/test';
import {
  hasCredentials,
  loginWithCredentials,
  readAuthStorage,
} from '../support/module1-auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M1-T02 | Tokens stored after login', async ({ page }) => {
  await loginWithCredentials(page);
  const authStorage = await readAuthStorage(page);

  expect(authStorage.accessToken).toBeTruthy();
  expect(authStorage.refreshToken).toBeTruthy();
});
