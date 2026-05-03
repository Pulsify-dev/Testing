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

    test('TC-M3-REL-01: follow controls are available on follower cards or a handled state is shown', async ({ page }) => {
        const followButtons = page.locator('.sc-follow-btn');
        const count = await followButtons.count();

        if (count === 0) {
            expect(await hasUserListHandledState(page)).toBeTruthy();
            return;
        }

        await expect(followButtons.first()).toBeVisible();
        const label = await normalizeLabel(followButtons.first());
        expect(label.includes('follow') || label.includes('following') || label.includes('unfollow')).toBeTruthy();
    });
});
