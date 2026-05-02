import { test, expect } from '@playwright/test';

test('TC-M11-ADM-01: /admin route is not publicly accessible — redirected or 403', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);

    // Route must NOT render an admin panel to unauthenticated users
    const isRedirected = !page.url().includes('/admin') || page.url().includes('/login');
    const hasAccessDenied = (await page.locator('text=/403|forbidden|access denied|not authorized/i').count()) > 0;
    const hasLoginGate = (await page.locator('text=/sign in|log in|login/i').count()) > 0;
    const hasAdminPanel = (await page.locator('[class*="admin-panel"], [class*="admin-dashboard"]').count()) > 0;

    // Admin panel must NOT be visible without credentials
    expect(hasAdminPanel).toBeFalsy();
    expect(isRedirected || hasAccessDenied || hasLoginGate).toBeTruthy();
});
