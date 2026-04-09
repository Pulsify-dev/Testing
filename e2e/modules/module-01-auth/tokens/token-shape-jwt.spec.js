import { test, expect } from '@playwright/test';
import {
  hasCredentials,
  loginWithCredentials,
  looksLikeJwt,
  readAuthStorage,
} from '../support/module1-auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M1-T03 | Token shape matches JWT', async ({ page }) => {
  await loginWithCredentials(page);
  const authStorage = await readAuthStorage(page);

  expect(looksLikeJwt(authStorage.accessToken)).toBeTruthy();
  expect(looksLikeJwt(authStorage.refreshToken)).toBeTruthy();
});
