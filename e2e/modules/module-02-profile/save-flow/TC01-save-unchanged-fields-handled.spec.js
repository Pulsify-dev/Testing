import { test, expect } from '@playwright/test';
import { ProfileSelectors } from '../../../support/selectors.js';
import { hasCredentials, loginAndOpenProfile, openEditModal, submitProfileForm } from '../support/module2-profile.helper.js';

test.describe('Module 2 Save Flow', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-SAVE-01: Saving unchanged form yields handled success or error state', async ({ page }) => {
        await openEditModal(page);

        const outcome = await submitProfileForm(page);
        expect(['success', 'error']).toContain(outcome);

        if (outcome === 'success') {
            await expect(page.locator(ProfileSelectors.profilePage)).toBeVisible();
        } else {
            await expect(page.locator('.sc-error')).toContainText('Failed to update profile.');
        }
    });
});
