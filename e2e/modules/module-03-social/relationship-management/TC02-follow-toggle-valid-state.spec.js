import { test, expect } from '@playwright/test';
import {
    hasCredentials,
    hasUserListHandledState,
    loginAndOpenSocialRoute,
    normalizeLabel,
} from '../support/module3-social.helper.js';

test.describe('Module 3 Relationship Management', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated social tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenSocialRoute(page, '/followers');
    });

    test('TC-M3-REL-02: follow toggle keeps control in a valid post-action state', async ({ page }) => {
        const followButtons = page.locator('.sc-follow-btn');
        if ((await followButtons.count()) === 0) {
            expect(await hasUserListHandledState(page)).toBeTruthy();
            return;
        }

        const button = followButtons.first();
        await button.click();
        await expect(button).not.toBeDisabled();

        const nextLabel = await normalizeLabel(button);
        expect(nextLabel.includes('follow') || nextLabel.includes('following') || nextLabel.includes('unfollow')).toBeTruthy();
    });
});
