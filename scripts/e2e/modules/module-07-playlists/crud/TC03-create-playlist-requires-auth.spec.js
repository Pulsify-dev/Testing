import { test, expect } from '@playwright/test';

test('TC-M7-CRU-03: unauthenticated user cannot access Artist Studio — redirected or gated', async ({ page }) => {
    await page.goto('/my-tracks');
    await page.waitForTimeout(2000);

    // Must redirect to login or show an auth gate — must NOT render Artist Studio
    const hasArtistStudio = (await page.locator('text=Artist Studio').count()) > 0;
    const isRedirected = page.url().includes('/login') || page.url().includes('/signin');
    const hasAuthGate = (await page.locator('text=/sign in|log in|login/i').count()) > 0;

    expect(hasArtistStudio).toBeFalsy();
    expect(isRedirected || hasAuthGate).toBeTruthy();
});
