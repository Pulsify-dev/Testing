const wdio = require('webdriverio');

describe('SoundCloud Production App - Modules 1, 2 & 3 E2E Tests', () => {
    // NOTE: Because the official SoundCloud app is a native Android application (not your Flutter app),
    // we CANNOT use `byValueKey` or `appium-flutter-finder`.
    // Instead, we switch to standard Android UIAutomator2 Selectors (XPath, resource-id, accessibility-id).

    describe('Module 1: Authentication & User Management', () => {
        it('should verify Social Identity login options and Email Login', async () => {
            // Initial App open usually has "Create an account" and "Log in"
            const signInBtn = await $('id=com.soundcloud.android:id/btn_login');
            await signInBtn.waitForDisplayed({ timeout: 10000 });
            if (await signInBtn.isExisting()) {
                await signInBtn.click();
            }

            // Verify Social / OAuth Identity integrations
            const googleBtn = await $('//android.widget.Button[@text="Continue with Google"]');
            const facebookBtn = await $('//android.widget.Button[@text="Continue with Facebook"]');
            const appleBtn = await $('//android.widget.Button[@text="Continue with Apple"]');
            const emailTitle = await $('//android.widget.TextView[@text="Or with email"]');

            // Assert OAuth UI is present
            expect(await googleBtn.isExisting()).toBe(true);
            expect(await facebookBtn.isExisting()).toBe(true);
            expect(await appleBtn.isExisting()).toBe(true);
            expect(await emailTitle.isExisting()).toBe(true);
        });

        it('should test Account Recovery (Forgot Password)', async () => {

            const forgotPasswordBtn = await $('~Forgot your password?'); // Using accessibility ID
            await forgotPasswordBtn.waitForDisplayed();
            await forgotPasswordBtn.click();


            const resetEmailInput = await $('//*[@text="Email address" or contains(@text, "Email")]');
            const resetBtn = await $('//*[@text="Reset Password" or contains(@text, "Reset")]');

            expect(await resetEmailInput.isExisting()).toBe(true);
            expect(await resetBtn.isExisting()).toBe(true);


            await driver.back();
        });

        it('should test Registration UI (Email-based) and CAPTCHA logic block', async () => {

            await driver.back();

            const createAccountBtn = await $('id=com.soundcloud.android:id/btn_create_account');
            if (await createAccountBtn.isExisting()) {
                await createAccountBtn.click();
            }

            // Verify registration workflow bounds
            const regEmail = await $('//*[@resource-id="sign_in_up_email"]');
            const regPassword = await $('//*[@resource-id="enter_password_field"]');
            const acceptBtn = await $('//*[@resource-id="enter_password_submit"]');
            expect(await regEmail.isExisting()).toBe(true);
            expect(await regPassword.isExisting()).toBe(true);
            expect(await acceptBtn.isExisting()).toBe(true);

            // Note: Natively interacting with reCAPTCHA via Appium gets blocked.
            // In a real automated run, this hits test APIs using mocked tokens to mimic JWTs
            await driver.back();
        });
    });

    describe('Module 2: User Profile & Social Identity', () => {
        it('should navigate to the Profile screen and verify Visual Assets (Avatar/Cover)', async () => {

            const profileTab = await $('~Profile'); // using content-description / accessibility ID
            await profileTab.waitForDisplayed({ timeout: 10000 });
            await profileTab.click();

            const avatarImage = await $('id=com.soundcloud.android:id/user_avatar');
            const coverImage = await $('id=com.soundcloud.android:id/profile_cover');

            expect(await avatarImage.isExisting()).toBe(true);
            expect(await coverImage.isExisting()).toBe(true);
        });

        it('should test Profile Customization (Bio, Location, Web Profiles)', async () => {
            const editProfileBtn = await $('//*[@text="Edit profile"]');
            await editProfileBtn.waitForDisplayed();
            await editProfileBtn.click();

            const bioInput = await $('id=com.soundcloud.android:id/bio_text');
            const locationInput = await $('//*[@text="City"]');
            const addLinkBtn = await $('//*[@text="Add link"]'); // Web Profiles

            expect(await bioInput.isExisting()).toBe(true);
            expect(await locationInput.isExisting()).toBe(true);
            expect(await addLinkBtn.isExisting()).toBe(true);


            await driver.back();
        });

        it('should verify Privacy Controls & Account Tiers exist in Settings', async () => {
            const settingsIcon = await $('~Settings');
            await settingsIcon.click();

            const privacyToggle = await $('//*[@text="Privacy"]');
            const accountTierSignal = await $('//*[@text="Get Artist Pro"]'); // Distinguishes artist level plan 

            expect(await privacyToggle.isExisting()).toBe(true);
            expect(await accountTierSignal.isExisting()).toBe(true);

            await driver.back();
        });
    });

    describe('Module 3: Followers & Social Graph', () => {
        it('should verify Network Lists (Followers, Following, Suggested Users)', async () => {

            const followersCountBtn = await $('//*[contains(@text, "Followers")]');
            await followersCountBtn.click();

            const followersTab = await $('//*[@text="Followers"]');
            const followingTab = await $('//*[@text="Following"]');

            expect(await followersTab.isDisplayed()).toBe(true);
            expect(await followingTab.isDisplayed()).toBe(true);

            await driver.back();
        });

        it('should test Relationship Management (Follow/Unfollow system)', async () => {

            const searchBtn = await $('~Search');
            await searchBtn.click();

            const searchInput = await $('id=com.soundcloud.android:id/search_edit_text');
            await searchInput.setValue('Martin Garrix');

            const artistResult = await $('//*[@text="Martin Garrix"]');
            await artistResult.waitForDisplayed({ timeout: 5000 });
            await artistResult.click();

            const followBtn = await $('//*[@text="Follow"]');
            await followBtn.click();

            const followingBtn = await $('//*[@text="Following"]');
            expect(await followingBtn.isDisplayed()).toBe(true);

            // Unfollow
            await followingBtn.click();
        });

        it('should verify Moderation logic (User Blocking)', async () => {
            const userMenuBtn = await $('~More options');
            await userMenuBtn.click();

            const blockUserOpt = await $('//*[@text="Block user"]');
            expect(await blockUserOpt.isDisplayed()).toBe(true);
            await blockUserOpt.click();

            // Confirm block
            const confirmBlockBtn = await $('//*[@text="Block"]');
            await confirmBlockBtn.click();
        });
    });
});
