import { test, expect } from '@playwright/test';
import {
  hasCredentials,
  loginWithCredentials,
  readAuthStorage,
} from '../support/module1-auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-AUTH-LOGIN-08: successful login stores access and refresh tokens', async ({ page }) => {
  await loginWithCredentials(page);
  const authStorage = await readAuthStorage(page);

  expect(authStorage.accessToken).toBeTruthy();
  expect(authStorage.refreshToken).toBeTruthy();
});
