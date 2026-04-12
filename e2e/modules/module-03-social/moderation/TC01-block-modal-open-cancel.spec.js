import { test, expect } from '@playwright/test';
import {
    hasCredentials,
    hasUserListHandledState,
    loginAndOpenSocialRoute,
} from '../support/module3-social.helper.js';

test.describe('Module 3 Moderation', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated social tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenSocialRoute(page, '/following');
    });

    test('TC-M3-MOD-01: block modal opens from card actions and closes on cancel', async ({ page }) => {
        const moreButtons = page.locator('.sc-user-card__more-btn');
        if ((await moreButtons.count()) === 0) {
            expect(await hasUserListHandledState(page)).toBeTruthy();
            return;
        }

        await moreButtons.first().click();

        const modal = page.locator('.sc-block-modal');
        await expect(modal).toBeVisible();
        await expect(modal.locator('.sc-block-modal__title')).toContainText('Block');

        await modal.locator('.sc-cancel-btn').click();
        await expect(modal).toBeHidden();
    });
});
