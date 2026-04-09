import { expect } from '@playwright/test';

const ACCESS_TOKEN_KEY = 'pulsify_access_token';
const REFRESH_TOKEN_KEY = 'pulsify_refresh_token';

export function module1Env() {
  return {
    testUserEmail: process.env.TEST_USER_EMAIL,
    testUserPassword: process.env.TEST_USER_PASSWORD,
    runLiveRegistration:
      String(process.env.RUN_LIVE_REGISTRATION || '').toLowerCase() === 'true',
    registrationEmailPrefix:
      process.env.TEST_REGISTRATION_EMAIL_PREFIX || 'qa.module1',
  };
}

export function hasCredentials() {
  const { testUserEmail, testUserPassword } = module1Env();
  return Boolean(testUserEmail && testUserPassword);
}

export function makeUniqueEmail(prefix = 'qa.module1') {
  const stamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}.${stamp}.${random}@example.com`;
}

export function looksLikeJwt(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export async function loginWithCredentials(page) {
  const { testUserEmail, testUserPassword } = module1Env();

  await page.goto('/login');
  await page.fill('input[placeholder="Email address"]', testUserEmail);
  await page.fill('input[placeholder="Password"]', testUserPassword);
  await page.click('button:has-text("Sign in")');
  await expect(page).toHaveURL(/\/(home|feed|discover|profile|tracks)/);
}

export async function readAuthStorage(page) {
  return page.evaluate(
    ({ accessKey, refreshKey }) => ({
      accessToken: globalThis.localStorage.getItem(accessKey),
      refreshToken: globalThis.localStorage.getItem(refreshKey),
    }),
    { accessKey: ACCESS_TOKEN_KEY, refreshKey: REFRESH_TOKEN_KEY },
  );
}

export async function visibleSocialButtonCount(page, selector) {
  const locator = page.locator(selector);
  const count = await locator.count();
  let visible = 0;

  for (let i = 0; i < count; i += 1) {
    if (await locator.nth(i).isVisible()) visible += 1;
  }

  return visible;
}

export async function clearAuthStorage(page) {
  await page.evaluate(() => {
    globalThis.localStorage.removeItem('pulsify_access_token');
    globalThis.localStorage.removeItem('pulsify_refresh_token');
    globalThis.localStorage.removeItem('pulsify_user');
  });
}

export async function openUserMenu(page) {
  const trigger = page.locator('.auth-user-menu-trigger').first();
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.locator('.auth-user-dropdown')).toBeVisible();
}

export async function logoutViaNavbar(page) {
  await openUserMenu(page);
  await page.locator('.auth-user-dropdown-logout').first().click();
  await expect(page).toHaveURL(/\/(login|discover|feed|home)/);
}
