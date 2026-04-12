import { test, expect } from '@playwright/test';
import { editFieldLocators, hasCredentials, loginAndOpenProfile, openEditModal, submitProfileForm } from '../support/module2-profile.helper.js';

test.describe('Module 2 Save Flow', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-SAVE-04: Too-long display name is rejected with handled error state', async ({ page }) => {
        await openEditModal(page);

        const { displayNameInput } = editFieldLocators(page);
        await displayNameInput.fill('x'.repeat(55));

        const outcome = await submitProfileForm(page);
        expect(outcome).toBe('error');
        await expect(page.locator('.sc-error')).toContainText('Failed to update profile.');
    });
});
