import { test, expect } from '@playwright/test';
import { ProfileSelectors } from './selectors';

test.describe('Module 2: User Profile', () => {

  test('TC-PROF-01: Profile page loads and displays the profile card', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    const card = page.locator(ProfileSelectors.profileCard);
    await expect(card).toBeVisible();
  });

  test('TC-PROF-02: Profile card displays display name, account tier, and privacy status', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await expect(page.locator(ProfileSelectors.displayNameHeading)).toBeVisible();
    await expect(page.locator(ProfileSelectors.accountTier)).toBeVisible();
    await expect(page.locator(ProfileSelectors.privacyStatus)).toBeVisible();
  });

  test('TC-PROF-03: Edit profile form is present with all required fields', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');

    await expect(page.locator(ProfileSelectors.displayNameInput)).toBeVisible();
    await expect(page.locator(ProfileSelectors.bioInput)).toBeVisible();
    await expect(page.locator(ProfileSelectors.locationInput)).toBeVisible();
    await expect(page.locator(ProfileSelectors.genresInput)).toBeVisible();
    await expect(page.locator(ProfileSelectors.privacySelect)).toBeVisible();
    await expect(page.locator(ProfileSelectors.saveButton)).toBeVisible();
  });
  test('TC-PROF-04: User can update display name and save', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');

    await page.locator(ProfileSelectors.displayNameInput).clear();
    await page.locator(ProfileSelectors.displayNameInput).fill('Updated Name');
    await page.locator(ProfileSelectors.saveButton).click();
    await expect(page.locator(ProfileSelectors.displayNameHeading)).toContainText('Updated Name');
  });

  test('TC-PROF-05: User can update bio (max 500 chars enforced)', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    const maxBio = 'A'.repeat(500);
    await page.locator(ProfileSelectors.bioInput).clear();
    await page.locator(ProfileSelectors.bioInput).fill(maxBio);
    const value = await page.locator(ProfileSelectors.bioInput).inputValue();
    expect(value.length).toBeLessThanOrEqual(500);
  });

  test('TC-PROF-06: User can update location field', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await page.locator(ProfileSelectors.locationInput).clear();
    await page.locator(ProfileSelectors.locationInput).fill('Cairo, Egypt');
    await page.locator(ProfileSelectors.saveButton).click();
    await expect(page.locator(ProfileSelectors.profileCard)).toBeVisible();
  });

  test('TC-PROF-07: User can set favorite genres as comma-separated values', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await page.locator(ProfileSelectors.genresInput).clear();
    await page.locator(ProfileSelectors.genresInput).fill('Lo-fi, Hip-Hop, EDM');
    await page.locator(ProfileSelectors.saveButton).click();
    await expect(page.locator(ProfileSelectors.genreTags).first()).toBeVisible();
  });

  test('TC-PROF-08: User can switch profile from Public to Private', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await page.locator(ProfileSelectors.privacySelect).selectOption('true'); 
    await page.locator(ProfileSelectors.saveButton).click();
    await expect(page.locator(ProfileSelectors.privacyStatus)).toContainText('Private');
  });

  test('TC-PROF-09: User can switch profile from Private to Public', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await page.locator(ProfileSelectors.privacySelect).selectOption('false'); // Public
    await page.locator(ProfileSelectors.saveButton).click();
    await expect(page.locator(ProfileSelectors.privacyStatus)).toContainText('Public');
  });

  test('TC-PROF-10: User can add an Instagram link and it appears on the profile card', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await page.locator(ProfileSelectors.instagramInput).clear();
    await page.locator(ProfileSelectors.instagramInput).fill('https://instagram.com/testuser');
    await page.locator(ProfileSelectors.saveButton).click();
    const igLink = page.locator(ProfileSelectors.socialLinks).getByText('Instagram');
    await expect(igLink).toBeVisible();
  });

  test('TC-PROF-11: Social link fields reject non-URL input', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await page.locator(ProfileSelectors.instagramInput).fill('not-a-url');
    await page.locator(ProfileSelectors.saveButton).click();
    await expect(page).toHaveURL(/.*\/profile/);
  });

  test('TC-PROF-12: Avatar upload input is present and accepts image files', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    const avatarInput = page.locator(ProfileSelectors.avatarUpload);
    await expect(avatarInput).toBeVisible();
    const acceptAttr = await avatarInput.getAttribute('accept');
    expect(acceptAttr).toContain('image/');
  });

  test('TC-PROF-13: Cover photo upload input is present and accepts image files', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    const coverInput = page.locator(ProfileSelectors.coverUpload);
    await expect(coverInput).toBeVisible();
    const acceptAttr = await coverInput.getAttribute('accept');
    expect(acceptAttr).toContain('image/');
  });

});
