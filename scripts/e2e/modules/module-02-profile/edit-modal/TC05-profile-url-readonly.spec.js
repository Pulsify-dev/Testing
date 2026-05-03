import { test, expect } from '@playwright/test';
import { editFieldLocators, hasCredentials, loginAndOpenProfile, openEditModal } from '../support/module2-profile.helper.js';

test.describe('Module 2 Edit Modal', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-EDIT-05: Profile URL is read-only and keeps SoundCloud-style prefix', async ({ page }) => {
        await openEditModal(page);

        const { profileUrlInput, profileUrlPrefix } = editFieldLocators(page);
        await expect(profileUrlInput).toBeVisible();
        await expect(profileUrlInput).not.toBeEditable();
        await expect(profileUrlPrefix).toHaveText('soundcloud.com/');
    });
});
