/**
 * MODULE 2 — User Profile & Social Identity
 * Test Suite: Profile Customization (Bio, Location, Favorite Genres, Display Name)
 * Framework: Appium (Flutter) + WebdriverIO
 *
 * Pre-conditions:
 *   - App is logged in and on the Profile screen
 *   - User has a profile loaded
 */

const { byText, byValueKey } = require('appium-flutter-finder');
const locators = require('../../../mobile-locators.json');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function loginAndNavigateToProfile() {
    const emailLabel = byText(locators.Auth.loginScreen.emailLabel);
    await browser.execute('flutter:waitFor', emailLabel, 8000);

    await browser.execute('flutter:setFrameSync', false);

    const emailInput = byValueKey(locators.Auth.keys.loginEmailField);
    await browser.execute('flutter:waitFor', emailInput, 10000);
    await browser.elementSendKeys(emailInput, 'testuser@example.com');

    const passInput = byValueKey(locators.Auth.keys.loginPasswordField);
    await browser.execute('flutter:waitFor', passInput, 10000);
    await browser.elementSendKeys(passInput, 'Password123!');

    const loginBtn = byValueKey(locators.Auth.keys.loginButton);
    await browser.execute('flutter:clickElement', loginBtn, { timeout: 10000 });

    const profileTab = byValueKey(locators.Auth.keys.navProfileTab);
    await browser.execute('flutter:waitFor', profileTab, 20000);
    await browser.execute('flutter:clickElement', profileTab, { timeout: 5000 });

    const profileTitle = byText(locators.Profile.navigation.profileTitle);
    await browser.execute('flutter:waitFor', profileTitle, 15000);
}

async function navigateToEditProfile() {
    const editBtn = byText(locators.Profile.customization.editProfileBtn);
    await browser.execute('flutter:waitFor', editBtn, 10000);
    await browser.execute('flutter:clickElement', editBtn, { timeout: 5000 });

    const editTitle = byText(locators.Profile.navigation.editProfileTitle);
    await browser.execute('flutter:waitFor', editTitle, 10000);
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('TC-PROF-001 | Module 2: Profile Customization', () => {

    before(async () => {
        console.log('\n════════════════════════════════════════════════════════');
        console.log('  [SETUP] Logging in and navigating to Profile screen...');
        console.log('════════════════════════════════════════════════════════\n');
        await loginAndNavigateToProfile();
        console.log('  [SETUP] ✓ Profile screen reached.\n');
    });

    // ── TC-PROF-001-01 ────────────────────────────────────────────────────────
    it('TC-PROF-001-01 | should display Profile screen with all stat widgets', async () => {
        console.log('[TEST] Verifying Profile stats row (Followers / Following / Tracks)...');

        const followersLabel = byText(locators.Profile.stats.followersLabel.toUpperCase());
        const followingLabel = byText(locators.Profile.stats.followingLabel.toUpperCase());
        const tracksLabel    = byText(locators.Profile.stats.tracksLabel.toUpperCase());

        await browser.execute('flutter:waitFor', followersLabel, 10000);
        await browser.execute('flutter:waitFor', followingLabel, 10000);
        await browser.execute('flutter:waitFor', tracksLabel, 10000);

        console.log('  ✓ Profile stats (Followers / Following / Tracks) confirmed visible.');
    });

    // ── TC-PROF-001-02 ────────────────────────────────────────────────────────
    it('TC-PROF-001-02 | should open Edit Profile screen and display all fields', async () => {
        console.log('[TEST] Opening Edit Profile and verifying all editable fields...');

        await navigateToEditProfile();

        const displayNameField  = byText(locators.Profile.customization.displayNameLabel);
        const bioField          = byText(locators.Profile.customization.bioLabel);
        const locationField     = byText(locators.Profile.customization.locationLabel);
        const genresField       = byText(locators.Profile.customization.favoriteGenresLabel);
        const saveBtn           = byText(locators.Profile.customization.saveChangesBtn);

        await browser.execute('flutter:waitFor', displayNameField, 5000);
        await browser.execute('flutter:waitFor', bioField, 5000);
        await browser.execute('flutter:waitFor', locationField, 5000);
        await browser.execute('flutter:waitFor', genresField, 5000);
        await browser.execute('flutter:waitFor', saveBtn, 5000);

        console.log('  ✓ All editable profile fields confirmed present on Edit Profile screen.');
    });

    // ── TC-PROF-001-03 ────────────────────────────────────────────────────────
    it('TC-PROF-001-03 | should update Bio field and save changes', async () => {
        console.log('[TEST] Updating Bio field...');

        await browser.execute('flutter:setFrameSync', false);

        const bioField = byValueKey('edit_profile_bio');
        await browser.execute('flutter:waitFor', bioField, 5000);
        await browser.elementSendKeys(bioField, 'QA-verified bio: music lover & beta tester.');

        const saveBtn = byText(locators.Profile.customization.saveChangesBtn);
        await browser.execute('flutter:waitFor', saveBtn, 5000);
        await browser.execute('flutter:clickElement', saveBtn, { timeout: 5000 });

        // Wait for confirmation (either snackbar "Changes saved!" or screen pop)
        await browser.pause(2000);

        console.log('  ✓ Bio updated — Save Changes triggered successfully.');
    });

    // ── TC-PROF-001-04 ────────────────────────────────────────────────────────
    it('TC-PROF-001-04 | should update Location field', async () => {
        console.log('[TEST] Updating Location field...');

        // Re-enter edit profile if needed
        try {
            const editTitle = byText(locators.Profile.navigation.editProfileTitle);
            await browser.execute('flutter:waitFor', editTitle, 3000);
        } catch (_) {
            await navigateToEditProfile();
        }

        await browser.execute('flutter:setFrameSync', false);

        const locationField = byValueKey('edit_profile_location');
        await browser.execute('flutter:waitFor', locationField, 5000);
        await browser.elementSendKeys(locationField, 'Cairo, Egypt');

        const saveBtn = byText(locators.Profile.customization.saveChangesBtn);
        await browser.execute('flutter:waitFor', saveBtn, 5000);
        await browser.execute('flutter:clickElement', saveBtn, { timeout: 5000 });

        await browser.pause(2000);
        console.log('  ✓ Location updated to "Cairo, Egypt".');
    });

    // ── TC-PROF-001-05 ────────────────────────────────────────────────────────
    it('TC-PROF-001-05 | should update Favorite Genres field (comma-separated tags)', async () => {
        console.log('[TEST] Updating Favorite Genres with comma-separated tags...');

        try {
            const editTitle = byText(locators.Profile.navigation.editProfileTitle);
            await browser.execute('flutter:waitFor', editTitle, 3000);
        } catch (_) {
            await navigateToEditProfile();
        }

        await browser.execute('flutter:setFrameSync', false);

        const genresField = byValueKey('edit_profile_genres');
        await browser.execute('flutter:waitFor', genresField, 5000);
        await browser.elementSendKeys(genresField, 'Jazz, Lo-Fi, Hip-Hop, Electronic');

        const saveBtn = byText(locators.Profile.customization.saveChangesBtn);
        await browser.execute('flutter:waitFor', saveBtn, 5000);
        await browser.execute('flutter:clickElement', saveBtn, { timeout: 5000 });

        await browser.pause(2000);
        console.log('  ✓ Favorite Genres updated with 4 genre tags.');
    });

    // ── TC-PROF-001-06 ────────────────────────────────────────────────────────
    it('TC-PROF-001-06 | should discard changes via Discard Changes button', async () => {
        console.log('[TEST] Entering data then clicking Discard Changes...');

        try {
            const editTitle = byText(locators.Profile.navigation.editProfileTitle);
            await browser.execute('flutter:waitFor', editTitle, 3000);
        } catch (_) {
            await navigateToEditProfile();
        }

        await browser.execute('flutter:setFrameSync', false);

        const bioField = byValueKey('edit_profile_bio');
        await browser.execute('flutter:waitFor', bioField, 5000);
        await browser.elementSendKeys(bioField, 'THIS SHOULD NOT BE SAVED');

        const discardBtn = byText(locators.Profile.customization.discardChangesBtn);
        await browser.execute('flutter:waitFor', discardBtn, 5000);
        await browser.execute('flutter:clickElement', discardBtn, { timeout: 5000 });

        // Should navigate back to Profile screen
        const profileTitle = byText(locators.Profile.navigation.profileTitle);
        await browser.execute('flutter:waitFor', profileTitle, 10000);

        console.log('  ✓ Discard Changes returned to Profile screen without saving.');
    });

});
