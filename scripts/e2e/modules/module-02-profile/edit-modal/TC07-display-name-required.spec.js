import { test, expect } from '@playwright/test';
import { ProfileSelectors } from '../../../support/selectors.js';
import { editFieldLocators, hasCredentials, loginAndOpenProfile, openEditModal } from '../support/module2-profile.helper.js';

test.describe('Module 2 Edit Modal Validation', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-EDIT-07: Display name is required before submit', async ({ page }) => {
        await openEditModal(page);

        const { displayNameInput } = editFieldLocators(page);
        await displayNameInput.fill('');
        await page.locator(ProfileSelectors.saveButton).click();

        const isMissing = await displayNameInput.evaluate((input) => input.validity.valueMissing);
        expect(isMissing).toBeTruthy();
        await expect(page.locator(ProfileSelectors.editModal)).toBeVisible();
    });
});
