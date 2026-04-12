import { test, expect } from '@playwright/test';
import { ProfileSelectors } from '../../../support/selectors.js';
import { hasCredentials, loginAndOpenProfile } from '../support/module2-profile.helper.js';

test.describe('Module 2 Profile Card', () => {
    test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.');

    test.beforeEach(async ({ page }) => {
        await loginAndOpenProfile(page);
    });

    test('TC-M2-CARD-02: Profile identity and social counters are visible', async ({ page }) => {
        await expect(page.locator(ProfileSelectors.displayNameHeading)).toBeVisible();
        await expect(page.locator(ProfileSelectors.followersLabel)).toBeVisible();
        await expect(page.locator(ProfileSelectors.followingLabel)).toBeVisible();
    });
});
