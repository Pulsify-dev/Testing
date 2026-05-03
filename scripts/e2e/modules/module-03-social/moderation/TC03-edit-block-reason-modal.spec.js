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

    test('TC-M3-MOD-03: edit reason modal supports text updates and cancel', async ({ page }) => {
        const editButtons = page.locator('.sc-blocked-row__edit-btn');
        if ((await editButtons.count()) === 0) {
            expect(await hasBlockedListHandledState(page)).toBeTruthy();
            return;
        }

        await editButtons.first().click();

        const modal = page.locator('.sc-block-modal');
        await expect(modal).toBeVisible();
        await expect(modal.locator('.sc-block-modal__title')).toContainText('Edit Block Reason');

        const reasonInput = modal.locator('#block-reason');
        const reasonText = `QA reason ${Date.now()}`;
        await reasonInput.fill(reasonText);
        await expect(modal.locator('.sc-block-modal__charcount')).toContainText(`${reasonText.length}/500`);

        await modal.locator('.sc-cancel-btn').click();
        await expect(modal).toBeHidden();
    });
});
