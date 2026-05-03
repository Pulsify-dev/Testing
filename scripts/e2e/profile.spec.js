import { test, expect } from '@playwright/test';
import { ProfileSelectors } from './selectors';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

async function loginViaUi(page) {
  await page.goto('/login');
  await page.fill('input[placeholder="Email address"]', TEST_USER_EMAIL);
  await page.fill('input[placeholder="Password"]', TEST_USER_PASSWORD);
  await page.click('button:has-text("Sign in")');
  await expect(page).toHaveURL(/\/(home|feed|discover|profile|tracks)/);
}

test.describe('Module 2: User Profile (Blackbox, Unauthenticated)', () => {
  test('TC-PROF-01: /profile is protected and redirects guests', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/(login|unauthorized)/);
  });
});

test.describe('Module 2: User Profile (Blackbox, Authenticated)', () => {
  test.skip(
    !TEST_USER_EMAIL || !TEST_USER_PASSWORD,
    'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated profile tests.',
  );

  test.beforeEach(async ({ page }) => {
    await loginViaUi(page);
    await page.goto('/profile');
    await expect(page.locator(ProfileSelectors.profilePage)).toBeVisible();
  });

  test('TC-PROF-02: Profile page loads and displays the profile card', async ({ page }) => {
    const card = page.locator(ProfileSelectors.profileCard);
    await expect(card).toBeVisible();
  });

  test('TC-PROF-03: Profile card shows display identity and social counters', async ({ page }) => {
    await expect(page.locator(ProfileSelectors.displayNameHeading)).toBeVisible();
    await expect(page.locator(ProfileSelectors.followersLabel)).toBeVisible();
    await expect(page.locator(ProfileSelectors.followingLabel)).toBeVisible();
  });

  test('TC-PROF-04: Edit profile modal opens with editable fields', async ({ page }) => {
    await page.locator(ProfileSelectors.editButton).click();

    await expect(page.locator(ProfileSelectors.editModal)).toBeVisible();
    await expect(page.locator(ProfileSelectors.editTitle)).toBeVisible();
    await expect(page.locator(ProfileSelectors.editTextInputs).first()).toBeVisible();
    await expect(page.locator(ProfileSelectors.bioInput)).toBeVisible();
    await expect(page.locator(ProfileSelectors.saveButton)).toBeVisible();
  });

  test('TC-PROF-05: Avatar upload input exists and accepts image types', async ({ page }) => {
    await page.locator(ProfileSelectors.editButton).click();
    const avatarInput = page.locator(ProfileSelectors.avatarUpload);
    await expect(avatarInput).toBeVisible();
    const acceptAttr = await avatarInput.getAttribute('accept');
    expect(acceptAttr).toContain('image/');
  });

  test('TC-PROF-06: Cover upload input exists and accepts image types', async ({ page }) => {
    await page.locator(ProfileSelectors.editButton).click();
    const coverInput = page.locator(ProfileSelectors.coverUpload);
    await expect(coverInput).toBeVisible();
    const acceptAttr = await coverInput.getAttribute('accept');
    expect(acceptAttr).toContain('image/');
  });
});
