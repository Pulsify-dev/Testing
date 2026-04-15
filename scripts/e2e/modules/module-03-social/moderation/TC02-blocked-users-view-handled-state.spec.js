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

    test('TC-M3-MOD-02: blocked users route shows list content or a handled state', async ({ page }) => {
        expect(await hasBlockedListHandledState(page)).toBeTruthy();
    });
});
