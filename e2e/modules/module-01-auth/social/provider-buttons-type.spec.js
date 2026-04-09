import { test, expect } from '@playwright/test';
import { AuthSelectors } from '../../../support/selectors.js';

test('TC-M1-S02 | Social controls are buttons', async ({ page }) => {
  await page.goto('/login');

  const buttons = page.locator(AuthSelectors.oauthButtons);
  const count = await buttons.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i += 1) {
    await expect(buttons.nth(i)).toHaveAttribute('type', 'button');
  }
});
