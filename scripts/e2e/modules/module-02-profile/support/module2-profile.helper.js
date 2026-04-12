import { expect } from '@playwright/test';
import { ProfileSelectors } from '../../../support/selectors.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module2Env() {
    return {
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module2Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function loginAndOpenProfile(page) {
    const { testUserEmail, testUserPassword } = module2Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/profile');
    await expect(page.locator(ProfileSelectors.profilePage)).toBeVisible();
}

export async function openEditModal(page) {
    await page.locator(ProfileSelectors.editButton).click();
    await expect(page.locator(ProfileSelectors.editModal)).toBeVisible();
}

export function editFieldLocators(page) {
    return {
        displayNameInput: page.locator('.sc-edit-field:has-text("Display name") input.sc-edit-input'),
        cityInput: page.locator('.sc-edit-field:has-text("City") input.sc-edit-input'),
        countryInput: page.locator('.sc-edit-field:has-text("Country") input.sc-edit-input'),
        profileUrlInput: page.locator('.sc-edit-url-input'),
        profileUrlPrefix: page.locator('.sc-edit-url-prefix'),
        bioInput: page.locator(ProfileSelectors.bioInput),
    };
}

export async function submitProfileForm(page) {
    await page.locator(ProfileSelectors.saveButton).click();

    const modal = page.locator(ProfileSelectors.editModal);
    const pageError = page.locator('.sc-error');

    try {
        await Promise.race([
            modal.waitFor({ state: 'hidden', timeout: 12000 }),
            pageError.first().waitFor({ state: 'visible', timeout: 12000 }),
        ]);
    } catch {
        // Keep flowing to deterministic assertions below.
    }

    const hasError =
        (await pageError.count()) > 0 &&
        (await pageError.first().isVisible().catch(() => false));

    if (hasError) return 'error';

    await expect(modal).not.toBeVisible();
    return 'success';
}

export async function restoreProfileFields(page, { displayName, bio, city, country }) {
    await openEditModal(page);

    const { displayNameInput, bioInput, cityInput, countryInput } = editFieldLocators(page);

    await displayNameInput.fill(displayName);
    await bioInput.fill(bio);
    await cityInput.fill(city);
    await countryInput.fill(country);

    return submitProfileForm(page);
}
