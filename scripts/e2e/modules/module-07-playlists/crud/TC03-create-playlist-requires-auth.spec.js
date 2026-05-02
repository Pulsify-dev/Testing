import { test, expect } from '@playwright/test';

test.skip(true, 'Module 7 (Playlists) is not yet integrated — auth gating cannot be verified.');

test('TC-M7-CRU-03: unauthenticated user cannot access /playlists create flow — redirected or gated', async ({ page }) => {
    await page.goto('/playlists');

    // Route must redirect to login or render an auth gate — a 401 error page is not acceptable
    const isRedirected = page.url().includes('/login');
    const hasAuthGate = (await page.locator('text=/sign in|log in|login/i').count()) > 0;
    const hasErrorPage = (await page.locator('text=/401|unauthorized|request failed/i').count()) > 0;

    // Must be gated gracefully — not crashed
    expect(hasErrorPage).toBeFalsy();
    expect(isRedirected || hasAuthGate).toBeTruthy();
});
