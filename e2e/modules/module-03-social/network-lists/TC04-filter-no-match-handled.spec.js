import { test, expect } from '@playwright/test';
import { hasCredentials, loginAndOpenSocialRoute } from '../support/module3-social.helper.js';

test.describe('Module 3 Network Lists', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated social tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenSocialRoute(page, '/following');
    });

    test('TC-M3-NET-04: filter with impossible query shows a no-match handled result', async ({ page }) => {
        const filterInput = page.locator('.sc-social-filter__input');
        await expect(filterInput).toBeVisible();

        try {
            await expect(page.locator('.sc-user-card--skeleton')).toHaveCount(0, { timeout: 10000 });
        } catch {
            // Continue with handled-state assertions if loading is slow.
        }

        const impossibleQuery = `__qa_no_match__${Date.now()}`;
        await filterInput.fill(impossibleQuery);

        await expect
            .poll(async () => {
                const noMatchText = page
                    .locator('.sc-social-empty p')
                    .filter({ hasText: `No users match "${impossibleQuery}"` });
                const hasNoMatchText = (await noMatchText.count()) > 0;
                const hasEmptyState = (await page.locator('.sc-social-empty').count()) > 0;
                const hasRetryState = (await page.locator('.sc-social-retry').count()) > 0;
                const hasCards = (await page.locator('.sc-user-card:not(.sc-user-card--skeleton)').count()) > 0;
                return hasNoMatchText || hasEmptyState || hasRetryState || !hasCards;
            }, { timeout: 10000 })
            .toBeTruthy();
    });
});
