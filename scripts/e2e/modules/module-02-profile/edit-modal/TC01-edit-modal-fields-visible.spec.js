import { test, expect } from '@playwright/test';
import { ProfileSelectors } from '../../../support/selectors.js';
import { hasCredentials, loginAndOpenProfile, openEditModal } from '../support/module2-profile.helper.js';

test.describe('Module 2 Edit Modal', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-EDIT-01: Edit profile modal opens with editable fields', async ({ page }) => {
        await openEditModal(page);

        await expect(page.locator(ProfileSelectors.editTitle)).toBeVisible();
        await expect(page.locator(ProfileSelectors.editTextInputs).first()).toBeVisible();
        await expect(page.locator(ProfileSelectors.bioInput)).toBeVisible();
        await expect(page.locator(ProfileSelectors.saveButton)).toBeVisible();
    });
});
