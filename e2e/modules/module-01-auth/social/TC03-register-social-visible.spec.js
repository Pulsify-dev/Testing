import { test, expect } from '@playwright/test';
import { RegisterSelectors } from '../../../support/selectors.js';

test('TC-M1-S03 | Register social options visible', async ({ page }) => {
  await page.goto('/register');

  const socialButtons = page.locator(RegisterSelectors.socialButtons);
  await expect(socialButtons.first()).toBeVisible();
});
