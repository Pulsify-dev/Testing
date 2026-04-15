import { test, expect } from '@playwright/test';
import { RegisterSelectors } from '../../../support/selectors.js';
import {
  module1Env,
  makeUniqueEmail,
} from '../support/module1-auth.helper.js';

const { runLiveRegistration, registrationEmailPrefix } = module1Env();
const manualCaptchaWaitMs = 3 * 60 * 1000;

test.skip(!runLiveRegistration, 'Set RUN_LIVE_REGISTRATION=true to run this live registration flow.');

test('TC-M1-V04 | live registration shows check-email state', async ({ page }) => {
  test.setTimeout(manualCaptchaWaitMs + 60 * 1000);

  const email = makeUniqueEmail(registrationEmailPrefix);

  await page.goto('/register');
  await page.fill(RegisterSelectors.usernameInput, `usr${Date.now().toString().slice(-6)}`);
  await page.fill(RegisterSelectors.emailInput, email);
  await page.fill(RegisterSelectors.passwordInput, 'ValidPassword123!');
  await page.check(RegisterSelectors.termsCheckbox);
  await expect(page.locator(RegisterSelectors.termsCheckbox)).toBeChecked();

  const submitButton = page.locator(RegisterSelectors.submitButton);

  await expect(submitButton).toBeEnabled({ timeout: manualCaptchaWaitMs });
  await submitButton.click();

  await expect(page.locator(RegisterSelectors.checkEmailTitle)).toBeVisible({ timeout: 30000 });
  await expect(page.locator(RegisterSelectors.checkEmailHint)).toContainText(email);
});
