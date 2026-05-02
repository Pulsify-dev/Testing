import { test, expect } from '@playwright/test';
import { hasCredentials, module7Env } from '../support/module7-playlists.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(true, 'Module 7 (Playlists) is not yet integrated — detail track list cannot be verified.');

test('TC-M7-DET-02: playlist detail page renders track list or empty state', async ({ page }) => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');
    const { testUserEmail, testUserPassword } = module7Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/playlists');

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });

    const cardLink = page.locator('.pulsify-card-name').first();
    await expect(cardLink).toBeVisible({ timeout: 10000 });

    const href = await cardLink.getAttribute('href');
    expect(href).toBeTruthy();
    await page.goto(href);

    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });

    // Must show tracks or an explicit empty state — hasShell alone is not sufficient
    const hasTracks = (await page.locator('.pulsify-card-track-entry').count()) > 0;
    const hasEmpty = (await page.locator('text=/no track|empty playlist/i').count()) > 0;
    expect(hasTracks || hasEmpty).toBeTruthy();
});
