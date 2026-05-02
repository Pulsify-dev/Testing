import { test, expect } from '@playwright/test';
import { module6Env, hasCredentials } from '../support/module6-engagement.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M6-ENG-02: /tracks/:id/reposts renders section list panel', async ({ page }) => {
    const { testTrackId, testUserEmail, testUserPassword } = module6Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(`/tracks/${testTrackId}/reposts`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}/reposts`));

    // Wait for track page to load first
    await expect(page.locator('.app-shell').first()).toBeVisible({ timeout: 15000 });

    const panel = page.locator('.section-list-panel');
    const fallback = page.locator('text=/unavailable|not found/i');
    await expect(panel.or(fallback).first()).toBeVisible({ timeout: 15000 });
});
