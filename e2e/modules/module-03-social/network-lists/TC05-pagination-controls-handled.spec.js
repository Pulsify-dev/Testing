import { test, expect } from '@playwright/test';
import { hasCredentials, hasUserListHandledState, loginAndOpenSocialRoute } from '../support/module3-social.helper.js';

test.describe('Module 3 Network Lists', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated social tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenSocialRoute(page, '/following');
    });

    test('TC-M3-NET-05: pagination controls are valid when pagination is shown', async ({ page }) => {
        const pagination = page.locator('.sc-social-pagination');
        if ((await pagination.count()) === 0) {
            expect(await hasUserListHandledState(page)).toBeTruthy();
            return;
        }

        const prevButton = pagination.locator('.sc-social-pagination__btn').first();
        const nextButton = pagination.locator('.sc-social-pagination__btn').nth(1);

        await expect(prevButton).toBeVisible();
        await expect(nextButton).toBeVisible();
        await expect(pagination.locator('.sc-social-pagination__info')).toContainText('Page');

        const prevDisabled = await prevButton.isDisabled();
        const nextDisabled = await nextButton.isDisabled();
        expect(prevDisabled && nextDisabled).toBeFalsy();
    });
});
