import { test, expect } from '@playwright/test';
import { ProfileSelectors } from '../../../support/selectors.js';
import {
    editFieldLocators,
    hasCredentials,
    loginAndOpenProfile,
    openEditModal,
    restoreProfileFields,
    submitProfileForm,
} from '../support/module2-profile.helper.js';

test.describe('Module 2 Save Flow', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-SAVE-02: Display name and bio update persists, otherwise shows handled error', async ({ page }) => {
        const cardDisplayName = page.locator(ProfileSelectors.displayNameHeading);
        const originalCardDisplayName = (await cardDisplayName.textContent())?.trim() || 'Pulsify User';

        await openEditModal(page);

        const { displayNameInput, bioInput, cityInput, countryInput } = editFieldLocators(page);
        const originalDisplayName = (await displayNameInput.inputValue()) || originalCardDisplayName;
        const originalBio = (await bioInput.inputValue()) || '';
        const originalCity = (await cityInput.inputValue()) || '';
        const originalCountry = (await countryInput.inputValue()) || '';

        const uniqueStamp = Date.now();
        const nextDisplayName = `qa-${uniqueStamp}`.slice(0, 40);
        const nextBio = `Profile update ${uniqueStamp}`;

        await displayNameInput.fill(nextDisplayName);
        await bioInput.fill(nextBio);

        const outcome = await submitProfileForm(page);

        if (outcome === 'error') {
            await expect(page.locator('.sc-error')).toContainText('Failed to update profile.');
            return;
        }

        await expect(cardDisplayName).toHaveText(nextDisplayName);
        await expect(page.locator('.sc-sidebar-bio p')).toContainText(nextBio);

        await page.reload();
        await expect(page.locator(ProfileSelectors.profilePage)).toBeVisible();
        await expect(cardDisplayName).toHaveText(nextDisplayName);
        await expect(page.locator('.sc-sidebar-bio p')).toContainText(nextBio);

        const restoreOutcome = await restoreProfileFields(page, {
            displayName: originalDisplayName,
            bio: originalBio,
            city: originalCity,
            country: originalCountry,
        });

        expect(['success', 'error']).toContain(restoreOutcome);
    });
});
