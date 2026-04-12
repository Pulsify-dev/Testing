const wdio = require('webdriverio');

describe('SoundCloud Production App - Modules 1, 2 & 3 E2E Tests', () => {
    // NOTE: Because the official SoundCloud app is a native Android application (not your Flutter app),
    // we CANNOT use `byValueKey` or `appium-flutter-finder`.
    // Instead, we switch to standard Android UIAutomator2 Selectors (XPath, resource-id, accessibility-id).

    describe.only('Module 1: Authentication & User Management', () => {
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
            try {
                // 0. Wait up to 5 seconds for "Or with email" to be displayed and click it
                const emailOption = await $('//*[@text="Or with email"]');
                await emailOption.waitForDisplayed({ timeout: 5000 });
                await emailOption.click();

                // 1. Enter a REGISTERED email in the field. 
                // We will use "test@gmail.com" because it is statistically guaranteed to be tied 
                // to an existing SoundCloud account, forcing the app to show the actual login screen.
                const emailInput = await $('//android.widget.EditText');
                await emailInput.waitForDisplayed({ timeout: 5000 });
                await emailInput.setValue('test@gmail.com');

                // 2. Tap "Continue" to transition to the actual Login/Password screen
                const continueBtn = await $('//*[@text="Continue"]');
                await continueBtn.click();

                await browser.pause(2000);

                // 3. Now the "Forgot your password?" element should be visible on the Login screen. Broadening the XPath in case it says "Forgot password?"
                const forgotPasswordBtn = await $('//*[contains(@text, "Forgot") or contains(@text, "forgot") or contains(@content-desc, "Forgot")]');
                await forgotPasswordBtn.waitForDisplayed({ timeout: 10000 });
                await forgotPasswordBtn.click();

                const resetEmailInput = await $('//*[@text="Email address" or contains(@text, "Email") or contains(@text, "email")]');
                await resetEmailInput.waitForDisplayed({ timeout: 5000 });
                const resetBtn = await $('//*[@text="Reset Password" or contains(@text, "Reset") or contains(@text, "Continue") or contains(@text, "SEND")]');

                expect(await resetEmailInput.isExisting()).toBe(true);
                expect(await resetBtn.isExisting()).toBe(true);

            } finally {
                // ALWAYS clean up to ensure the next block starts from the main screen
                // Even if the test fails midway, we back out twice
                await browser.back();
                await browser.back();
                // Adding a pause so the animation finishes before the next test
                await browser.pause(2000);
            }
        });

        it('should test Registration UI (Email-based) and Onboarding Profile Setup', async () => {

            // We are already back at the start screen because of the `finally` block above.
            const createAccountBtn = await $('id=com.soundcloud.android:id/btn_create_account');
            await createAccountBtn.waitForDisplayed({ timeout: 5000 });
            await createAccountBtn.click();

            // 1. Wait for "Or with email" and click it
            const emailOption = await $('//*[@text="Or with email"]');
            await emailOption.waitForDisplayed({ timeout: 5000 });
            await emailOption.click();

            // 2. Add an unregistered email to trigger Create Account sequentially
            const emailInput = await $('//android.widget.EditText');
            await emailInput.waitForDisplayed({ timeout: 5000 });
            // Using a timestamp guarantees this email is unregistered so we hit the creation flow
            await emailInput.setValue(`test.newuser${Date.now()}@example.com`);

            const continueBtn = await $('//*[@text="Continue"]');
            await continueBtn.click();

            // 3. "Choose a password" page appears (Sequential flow)
            // Hard wait to prevent race condition with the previous page's EditText
            await browser.pause(2000);

            const pwdTitle = await $('//*[@text="Choose a password"]');
            await pwdTitle.waitForDisplayed({ timeout: 10000 });

            const passwordInput = await $('//android.widget.EditText');
            await passwordInput.setValue('TestAppium123!');

            // Hit continue on the password page
            const pwdContinueBtn = await $('//*[@text="Continue"]');
            await pwdContinueBtn.click();

            // 4. "Tell us more about you" onboarding screen (From Screenshot)
            await browser.pause(2000);
            const onboardingTitle = await $('//*[@text="Tell us more about you"]');
            await onboardingTitle.waitForDisplayed({ timeout: 7000 });

            const displayNameInput = await $('//android.widget.EditText'); // "Loles21" goes here
            const monthDropdown = await $('//*[@text="Month"]');
            const dayDropdown = await $('//*[@text="Day"]');
            const yearDropdown = await $('//*[@text="Year"]');
            const genderDropdown = await $('//*[@text="Gender (required)"]');
            const finalContinueBtn = await $('//*[@text="Continue"]');

            // Assert that the exact onboarding elements shown in your screenshot exist
            expect(await onboardingTitle.isExisting()).toBe(true);
            expect(await displayNameInput.isExisting()).toBe(true);
            expect(await monthDropdown.isExisting()).toBe(true);
            expect(await dayDropdown.isExisting()).toBe(true);
            expect(await yearDropdown.isExisting()).toBe(true);
            expect(await genderDropdown.isExisting()).toBe(true);
            expect(await finalContinueBtn.isExisting()).toBe(true);

            // Clean up: Back out to start screen so Module 2 doesn't crash
            await browser.back();
            await browser.back();
            await browser.back();
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


            await browser.back();
        });

        it('should verify Privacy Controls & Account Tiers exist in Settings', async () => {
            const settingsIcon = await $('~Settings');
            await settingsIcon.click();

            const privacyToggle = await $('//*[@text="Privacy"]');
            const accountTierSignal = await $('//*[@text="Get Artist Pro"]'); // Distinguishes artist level plan 

            expect(await privacyToggle.isExisting()).toBe(true);
            expect(await accountTierSignal.isExisting()).toBe(true);

            await browser.back();
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

            await browser.back();
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
