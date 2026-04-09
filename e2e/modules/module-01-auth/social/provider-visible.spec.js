import { test, expect } from '@playwright/test';
import { AuthSelectors } from '../../../support/selectors.js';
import { visibleSocialButtonCount } from '../support/module1-auth.helper.js';

test('TC-M1-S01 | Social provider is visible', async ({ page }) => {
  await page.goto('/login');
  const visibleCount = await visibleSocialButtonCount(page, AuthSelectors.oauthButtons);
  expect(visibleCount).toBeGreaterThan(0);
});
