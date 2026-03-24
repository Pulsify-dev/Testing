const { byText, byValueKey } = require('appium-flutter-finder');
const locators = require('../../../mobile-locators.json');

describe('Module 1: Authentication', () => {

    it('should allow user to type email and navigate', async () => {
        console.log('\n======================================================');
        console.log(' Starting Login Automation Test (Frontend Only)...');
        console.log('======================================================\n');
        
        const emailLabel = byText(locators.Auth.loginScreen.emailLabel);
        // Wait for screen to load
        console.log('\n Waiting for Login Screen to load in the App...');
        await browser.execute('flutter:waitFor', emailLabel, 10000);
        console.log(' Login Screen loaded successfully!');

        const emailInput = byValueKey('login_email_field');
        
        // Disable frame sync to prevent timeouts from animations
        await browser.execute('flutter:setFrameSync', false);
        
        console.log('⌨️  Typing Email: testuser@example.com');
        await browser.elementClick(emailInput);
        await browser.execute('flutter:enterText', 'testuser@example.com');
        
        const passInput = byValueKey('login_password_field');
        console.log('⌨️  Typing Password: Password123!');
        await browser.elementClick(passInput);
        await browser.execute('flutter:enterText', 'Password123!');

        const loginBtn = byValueKey('login_button');
        // Click Login
        console.log(' Clicking Log In button...');
        await browser.elementClick(loginBtn);

        // Wait and verify we move off the login screen (to Profile/Home)
        console.log(' Checking if app navigates to Profile tab...');
        const profileTab = byValueKey('nav_profile_tab');
        await browser.execute('flutter:waitFor', profileTab, 15000);
        console.log('\n======================================================');
        console.log(' SUCCESS! Correct login confirmed! App is now on the Profile tab.');
        console.log('======================================================\n');
    });
});
