import { test, expect } from '@playwright/test';
import { ProfileSelectors } from '../../../support/selectors.js';
import { editFieldLocators, hasCredentials, loginAndOpenProfile, openEditModal } from '../support/module2-profile.helper.js';

test.describe('Module 2 Edit Modal', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-EDIT-04: Cancel closes modal and keeps original display name', async ({ page }) => {
        const cardDisplayName = page.locator(ProfileSelectors.displayNameHeading);
        const originalDisplayName = (await cardDisplayName.textContent())?.trim() || '';

        await openEditModal(page);

        const { displayNameInput } = editFieldLocators(page);
        await displayNameInput.fill(`${originalDisplayName} Temporary`);

        await page.locator(ProfileSelectors.cancelButton).click();
        await expect(page.locator(ProfileSelectors.editModal)).not.toBeVisible();
        await expect(cardDisplayName).toHaveText(originalDisplayName);
    });
});
