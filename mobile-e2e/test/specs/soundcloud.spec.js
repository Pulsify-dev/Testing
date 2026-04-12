const wdio = require('webdriverio');

describe('SoundCloud Production App - Modules 1, 2 & 3 E2E Tests', () => {

    describe.only('Module 1: Authentication & User Management', () => {
        it('should verify Social Identity login options and Email Login', async () => {

            const signInBtn = await $('id=com.soundcloud.android:id/btn_login');
            await signInBtn.waitForDisplayed({ timeout: 10000 });
            if (await signInBtn.isExisting()) {
                await signInBtn.click();
            }

            const googleBtn = await $('//android.widget.Button[@text="Continue with Google"]');
            const facebookBtn = await $('//android.widget.Button[@text="Continue with Facebook"]');
            const appleBtn = await $('//android.widget.Button[@text="Continue with Apple"]');
            const emailTitle = await $('//android.widget.TextView[@text="Or with email"]');

            expect(await googleBtn.isExisting()).toBe(true);
            expect(await facebookBtn.isExisting()).toBe(true);
            expect(await appleBtn.isExisting()).toBe(true);
            expect(await emailTitle.isExisting()).toBe(true);
        });

        it('should test Account Recovery (Forgot Password)', async () => {
            try {

                const emailOption = await $('//*[@text="Or with email"]');
                await emailOption.waitForDisplayed({ timeout: 5000 });
                await emailOption.click();

                const emailInput = await $('//android.widget.EditText');
                await emailInput.waitForDisplayed({ timeout: 5000 });
                await emailInput.setValue('test@gmail.com');

                const continueBtn = await $('//*[@text="Continue"]');
                await continueBtn.click();

                await browser.pause(2000);

                const forgotPasswordBtn = await $('//*[contains(@text, "Forgot") or contains(@text, "forgot") or contains(@content-desc, "Forgot")]');
                await forgotPasswordBtn.waitForDisplayed({ timeout: 10000 });
                await forgotPasswordBtn.click();

                const resetEmailInput = await $('//*[@text="Email address" or contains(@text, "Email") or contains(@text, "email")]');
                await resetEmailInput.waitForDisplayed({ timeout: 5000 });
                const resetBtn = await $('//*[@text="Reset Password" or contains(@text, "Reset") or contains(@text, "Continue") or contains(@text, "SEND")]');

                expect(await resetEmailInput.isExisting()).toBe(true);
                expect(await resetBtn.isExisting()).toBe(true);

            } finally {

                await browser.back();
                await browser.back();

                await browser.pause(2000);
            }
        });

        it('should test Registration UI (Email-based) and Onboarding Profile Setup', async () => {

            const createAccountBtn = await $('id=com.soundcloud.android:id/btn_create_account');
            await createAccountBtn.waitForDisplayed({ timeout: 5000 });
            await createAccountBtn.click();

            const emailOption = await $('//*[@text="Or with email"]');
            await emailOption.waitForDisplayed({ timeout: 5000 });
            await emailOption.click();

            const emailInput = await $('//android.widget.EditText');
            await emailInput.waitForDisplayed({ timeout: 5000 });

            await emailInput.setValue(`test.newuser${Date.now()}@example.com`);

            const continueBtn = await $('//*[@text="Continue"]');
            await continueBtn.click();

            await browser.pause(2000);

            const pwdTitle = await $('//*[@text="Choose a password"]');
            await pwdTitle.waitForDisplayed({ timeout: 10000 });

            const passwordInput = await $('//android.widget.EditText');
            await passwordInput.setValue('TestAppium123!');

            const pwdContinueBtn = await $('//*[@text="Continue"]');
            await pwdContinueBtn.click();

            await browser.pause(2000);
            const onboardingTitle = await $('//*[@text="Tell us more about you"]');
            await onboardingTitle.waitForDisplayed({ timeout: 7000 });

            const displayNameInput = await $('//android.widget.EditText');
            const monthDropdown = await $('//*[@text="Month"]');
            const dayDropdown = await $('//*[@text="Day"]');
            const yearDropdown = await $('//*[@text="Year"]');
            const genderDropdown = await $('//*[@text="Gender (required)"]');
            const finalContinueBtn = await $('//*[@text="Continue"]');

            expect(await onboardingTitle.isExisting()).toBe(true);
            expect(await displayNameInput.isExisting()).toBe(true);
            expect(await monthDropdown.isExisting()).toBe(true);
            expect(await dayDropdown.isExisting()).toBe(true);
            expect(await yearDropdown.isExisting()).toBe(true);
            expect(await genderDropdown.isExisting()).toBe(true);
            expect(await finalContinueBtn.isExisting()).toBe(true);

            await browser.back();
            await browser.back();
            await browser.back();
        });
    });

    describe('Module 2: User Profile & Social Identity', () => {
        it('should navigate to the Profile screen and verify Visual Assets (Avatar/Cover)', async () => {

            const profileTab = await $('~Profile');
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
            const addLinkBtn = await $('//*[@text="Add link"]');

            expect(await bioInput.isExisting()).toBe(true);
            expect(await locationInput.isExisting()).toBe(true);
            expect(await addLinkBtn.isExisting()).toBe(true);

            await browser.back();
        });

        it('should verify Privacy Controls & Account Tiers exist in Settings', async () => {
            const settingsIcon = await $('~Settings');
            await settingsIcon.click();

            const privacyToggle = await $('//*[@text="Privacy"]');
            const accountTierSignal = await $('//*[@text="Get Artist Pro"]');

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

            await followingBtn.click();
        });

        it('should verify Moderation logic (User Blocking)', async () => {
            const userMenuBtn = await $('~More options');
            await userMenuBtn.click();

            const blockUserOpt = await $('//*[@text="Block user"]');
            expect(await blockUserOpt.isDisplayed()).toBe(true);
            await blockUserOpt.click();

            const confirmBlockBtn = await $('//*[@text="Block"]');
            await confirmBlockBtn.click();
        });
    });
});
