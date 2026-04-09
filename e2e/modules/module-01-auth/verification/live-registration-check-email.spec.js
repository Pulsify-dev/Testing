import { test, expect } from '@playwright/test';
import { RegisterSelectors } from '../../../support/selectors.js';
import {
  module1Env,
  makeUniqueEmail,
} from '../support/module1-auth.helper.js';

const { runLiveRegistration, registrationEmailPrefix } = module1Env();

test.skip(!runLiveRegistration, 'Set RUN_LIVE_REGISTRATION=true to run this live registration flow.');

test('TC-M1-V04 | live registration shows check-email state', async ({ page }) => {
  const email = makeUniqueEmail(registrationEmailPrefix);

  await page.goto('/register');
  await page.fill(RegisterSelectors.usernameInput, `usr${Date.now().toString().slice(-6)}`);
  await page.fill(RegisterSelectors.emailInput, email);
  await page.fill(RegisterSelectors.passwordInput, 'ValidPassword123!');
  await page.check(RegisterSelectors.termsCheckbox);

  // NOTE: CAPTCHA must be completed manually during this test.
  await page.click(RegisterSelectors.submitButton);

  await expect(page.locator(RegisterSelectors.checkEmailTitle)).toBeVisible({ timeout: 30000 });
  await expect(page.locator(RegisterSelectors.checkEmailHint)).toContainText(email);
});
