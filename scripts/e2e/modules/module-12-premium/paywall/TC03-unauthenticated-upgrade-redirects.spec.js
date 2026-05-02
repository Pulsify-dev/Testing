import { test, expect } from '@playwright/test';

test('TC-M12-PAY-03: unauthenticated user accessing upgrade/pricing page is handled gracefully', async ({ page }) => {
    await page.goto('/upgrade');
    await page.waitForTimeout(2000);

    // Must either render pricing page OR redirect to login — not crash with an error
    const hasError = (await page.locator('text=/500|request failed|something went wrong/i').count()) > 0;
    expect(hasError).toBeFalsy();

    const showsContent = (await page.locator('nav, header').count()) > 0;
    expect(showsContent).toBeTruthy();
});
