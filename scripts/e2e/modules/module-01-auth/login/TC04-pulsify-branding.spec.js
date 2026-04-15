import { test, expect } from '@playwright/test';
import { AuthSelectors } from '../../../support/selectors.js';

test('TC-M1-L04 | Pulsify branding', async ({ page }) => {
  await page.goto('/login');
  const termsText = page.locator(AuthSelectors.termsText);
  const navbarBrand = page.locator(AuthSelectors.navbarBrand);

  await expect(termsText).toContainText('Pulsify');
  await expect(termsText).not.toContainText('SoundCloud');
  await expect(navbarBrand).toContainText('Pulsify');
  await expect(navbarBrand).not.toContainText('SoundCloud');
});
