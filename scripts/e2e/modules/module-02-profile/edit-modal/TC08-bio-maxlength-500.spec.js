import { test, expect } from '@playwright/test';
import { editFieldLocators, hasCredentials, loginAndOpenProfile, openEditModal } from '../support/module2-profile.helper.js';

test.describe('Module 2 Edit Modal Validation', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-EDIT-08: Bio textarea enforces 500-character limit client-side', async ({ page }) => {
        await openEditModal(page);

        const { bioInput } = editFieldLocators(page);
        const longBio = 'a'.repeat(650);
        await bioInput.fill(longBio);

        const value = await bioInput.inputValue();
        expect(value.length).toBeLessThanOrEqual(500);
    });
});
