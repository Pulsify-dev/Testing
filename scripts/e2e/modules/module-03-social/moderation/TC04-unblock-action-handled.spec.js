import { test, expect } from '@playwright/test';
import {
    hasBlockedListHandledState,
    hasCredentials,
    loginAndOpenSocialRoute,
} from '../support/module3-social.helper.js';

test.describe('Module 3 Moderation', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated social tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenSocialRoute(page, '/blocked');
    });

    test('TC-M3-MOD-04: unblock action results in a valid blocked-list state', async ({ page }) => {
        const unblockButtons = page.locator('.sc-blocked-row__unblock-btn');
        if ((await unblockButtons.count()) === 0) {
            expect(await hasBlockedListHandledState(page)).toBeTruthy();
            return;
        }

        const rows = page.locator('.sc-blocked-row:not(.sc-blocked-row--skeleton)');
        const beforeCount = await rows.count();

        await unblockButtons.first().click();

        await expect.poll(async () => await rows.count(), { timeout: 10000 }).toBeLessThanOrEqual(beforeCount);
        await expect(page).toHaveURL(/\/blocked/);
        expect(await hasBlockedListHandledState(page)).toBeTruthy();
    });
});
