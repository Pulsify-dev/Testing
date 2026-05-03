import { test, expect } from '@playwright/test';
import { ProfileSelectors } from '../../../support/selectors.js';
import { hasCredentials, loginAndOpenProfile, openEditModal } from '../support/module2-profile.helper.js';

test.describe('Module 2 Edit Modal', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-EDIT-03: Cover file input is visible and accepts image MIME types', async ({ page }) => {
        await openEditModal(page);

        const coverInput = page.locator(ProfileSelectors.coverUpload);
        await expect(coverInput).toBeVisible();
        const acceptAttr = await coverInput.getAttribute('accept');
        expect(acceptAttr).toContain('image/');
    });
});
