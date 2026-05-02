import { test, expect } from '@playwright/test';
import { hasCredentials, module7Env } from '../support/module7-playlists.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(true, 'Module 7 (Playlists) is not yet integrated — share modal cannot be verified.');

test('TC-M7-EMB-01: share/embed modal is accessible from a playlist detail page', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    const { testUserEmail, testUserPassword } = module7Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/playlists');

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });

    // Must have at least one playlist to navigate into
    const cardLink = page.locator('.pulsify-card-name').first();
    await expect(cardLink).toBeVisible({ timeout: 10000 });
    const href = await cardLink.getAttribute('href');
    expect(href).toBeTruthy();
    await page.goto(href);

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });

    // Share button must be present and open a modal when clicked
    const shareBtn = page.locator('button, [role="button"]').filter({ hasText: /share|embed/i }).first();
    await expect(shareBtn).toBeVisible({ timeout: 10000 });
    await shareBtn.click();
    await page.waitForTimeout(1000);

    await expect(page.locator('[class*="share"], [class*="modal"], [class*="embed"]').first()).toBeVisible({ timeout: 5000 });
});
