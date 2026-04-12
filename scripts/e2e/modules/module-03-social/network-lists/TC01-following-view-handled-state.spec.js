import { test, expect } from '@playwright/test';
import { hasCredentials, hasUserListHandledState, loginAndOpenSocialRoute } from '../support/module3-social.helper.js';

test.describe('Module 3 Network Lists', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated social tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenSocialRoute(page, '/following');
    });

    test('TC-M3-NET-01: following view shows cards or an explicit handled state', async ({ page }) => {
        expect(await hasUserListHandledState(page)).toBeTruthy();
    });
});
