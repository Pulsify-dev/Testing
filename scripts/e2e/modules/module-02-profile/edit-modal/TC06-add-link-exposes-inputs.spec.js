import { test, expect } from '@playwright/test';
import { ProfileSelectors } from '../../../support/selectors.js';
import { hasCredentials, loginAndOpenProfile, openEditModal } from '../support/module2-profile.helper.js';

test.describe('Module 2 Edit Modal', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-EDIT-06: Add link action exposes at least one link input', async ({ page }) => {
        await openEditModal(page);

        const linkInputs = page.locator(ProfileSelectors.linkInputs);
        const beforeCount = await linkInputs.count();

        await page.locator(ProfileSelectors.addLinkButton).click();

        const afterCount = await linkInputs.count();
        expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
        if (beforeCount === 0) {
            expect(afterCount).toBeGreaterThan(0);
        }
    });
});
