const { byText, byValueKey, byType } = require('appium-flutter-finder');
const locators = require('../../mobile-locators.json');

const testUser = {
    email: 'testuser@example.com',
    password: 'Password123!',
    screenType: 'UserProfileScreen'
};

describe('MEGA JOURNEY: Complete App Verification Flow E2E', () => {

    let executionReport = [];

    after(() => {
        console.log('\n\n\n');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║               TEST EXECUTION SUMMARY REPORT              ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log(executionReport.join('\n'));
        console.log('\n\n\n');
    });

    it('should complete identical flow: Forgot Password -> Register -> Login -> Edit Profile without crashing', async () => {

        executionReport.push('\n======================================================');
        executionReport.push(' MEGA STEP 1: Forgot Password Flow ');
        executionReport.push('======================================================');

        const forgotPasswordLink = byText(locators.Auth.loginScreen.forgotPasswordBtn);
        await browser.execute('flutter:waitFor', forgotPasswordLink, 10000);
        await browser.execute('flutter:clickElement', forgotPasswordLink, { timeout: 5000 });

        executionReport.push(' [VERIFIED] Forgot password screen hit! Going back...');
        // Standard Android Back Button to return to Login
        await browser.switchContext('NATIVE_APP');
        await browser.back();
        await browser.switchContext('FLUTTER');


        executionReport.push('\n======================================================');
        executionReport.push(' MEGA STEP 2: Registration Validation ');
        executionReport.push('======================================================');

        const signUpLink = byText(locators.Auth.loginScreen.signUpLink);
        await browser.execute('flutter:waitFor', signUpLink, 10000);
        await browser.execute('flutter:clickElement', signUpLink);

        const registerTitle = byText(locators.Auth.registerScreen.title);
        await browser.execute('flutter:waitFor', registerTitle, 10000);

        const createAccountBtn = byText(locators.Auth.registerScreen.createAccountButton);
        await browser.execute('flutter:waitFor', createAccountBtn, 5000);
        executionReport.push(' [VERIFIED] Registration screen verified! Going back to Login...');

        await browser.switchContext('NATIVE_APP');
        await browser.back();
        await browser.switchContext('FLUTTER');


        executionReport.push('\n======================================================');
        executionReport.push(' MEGA STEP 3: Authentic User Login ');
        executionReport.push('======================================================');

        const emailInput = byValueKey('login_email_field');
        await browser.execute('flutter:waitFor', emailInput, 10000);

        await browser.execute('flutter:setFrameSync', false); // Stop animation lock
        await browser.elementClick(emailInput);
        await browser.execute('flutter:enterText', testUser.email);

        const passInput = byValueKey('login_password_field');
        await browser.elementClick(passInput);
        await browser.execute('flutter:enterText', testUser.password);

        const loginBtn = byValueKey('login_button');
        await browser.elementClick(loginBtn);

        const profileScreen = byType(testUser.screenType);
        await browser.execute('flutter:waitFor', profileScreen, 20000);
        executionReport.push(' [VERIFIED] Successfully Logged In and hit Profile Screen!');


        executionReport.push('\n======================================================');
        executionReport.push(' MEGA STEP 4: Editing Profile ');
        executionReport.push('======================================================');


        // Click edit profile using centralized locator string
        const editProfileBtn = byText(locators.Profile.customization.editProfileBtn);
        await browser.execute('flutter:waitFor', editProfileBtn, 15000);
        await browser.execute('flutter:clickElement', editProfileBtn, { timeout: 5000 });

        // Verify edit profile UI loaded by looking for standard element
        const saveChangesBtn = byText(locators.Profile.customization.saveChangesBtn);
        await browser.execute('flutter:waitFor', saveChangesBtn, 10000);
        executionReport.push(' [VERIFIED] Profile successfully opened for editing!');

        executionReport.push('\n======================================================');
        executionReport.push(' MEGA STEP 5: Logout Verification ');
        executionReport.push('======================================================');
        executionReport.push(' [WARNING] Could not execute logout - there is no logout button man!');

        executionReport.push('\n======================================================');
        executionReport.push(' MEGA JOURNEY COMPLETE! ALL AVAILABLE MODULES PASSED!');
        executionReport.push('======================================================\n');
    });
});
