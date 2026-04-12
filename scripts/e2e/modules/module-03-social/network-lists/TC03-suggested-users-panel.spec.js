import { test, expect } from '@playwright/test';
import { hasCredentials, hasUserListHandledState, loginAndOpenSocialRoute } from '../support/module3-social.helper.js';

test.describe('Module 3 Network Lists', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated social tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenSocialRoute(page, '/following');
    });

    test('TC-M3-NET-03: suggested users panel is rendered or intentionally absent', async ({ page }) => {
        const suggestedPanel = page.locator('.sc-suggested');
        const panelCount = await suggestedPanel.count();

        if (panelCount === 0) {
            expect(await hasUserListHandledState(page)).toBeTruthy();
            return;
        }

        await expect(suggestedPanel.locator('.sc-suggested__title')).toContainText('Who to follow');

        const hasItems = (await suggestedPanel.locator('.sc-suggested__item').count()) > 0;
        const hasSkeleton = (await suggestedPanel.locator('.sc-suggested__skeleton-row').count()) > 0;
        expect(hasItems || hasSkeleton).toBeTruthy();

        if (hasItems) {
            await expect(suggestedPanel.locator('.sc-follow-btn').first()).toBeVisible();
        }
    });
});
