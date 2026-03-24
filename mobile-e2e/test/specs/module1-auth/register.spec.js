const { byText } = require('appium-flutter-finder');
const locators = require('../../../mobile-locators.json');

describe('Module 1: Authentication - Registration & Verification', () => {
    it('should navigate from Login to Registration screen', async () => {
        console.log('\n======================================================');
        console.log(' Starting Registration Automation Test...');
        console.log('======================================================\n');
        console.log(' Looking for Sign Up link...');

        const signUpLink = byText(locators.Auth.loginScreen.signUpLink);
        await browser.execute('flutter:waitFor', signUpLink, 10000);
        console.log(' Clicking Sign Up link...');
        await browser.execute('flutter:click', signUpLink);

        console.log(' Verifying navigation to Create Account screen...');
        const registerTitle = byText(locators.Auth.registerScreen.title);
        await browser.execute('flutter:waitFor', registerTitle, 10000);
        console.log(' Successfully navigated to Registration Screen!');
    });

    it('should verify all registration fields are physically present', async () => {
        console.log('\n Scanning for Registration Required Fields...');
        const usernameLabel = byText(locators.Auth.registerScreen.usernameLabel);
        const emailLabel = byText(locators.Auth.registerScreen.emailLabel);
        const passwordLabel = byText(locators.Auth.registerScreen.passwordLabel);
        const confirmPasswordLabel = byText(locators.Auth.registerScreen.confirmPasswordLabel);
        const createAccountBtn = byText(locators.Auth.registerScreen.createAccountButton);

        await browser.execute('flutter:waitFor', usernameLabel, 10000);
        await browser.execute('flutter:waitFor', emailLabel, 10000);
        await browser.execute('flutter:waitFor', passwordLabel, 10000);
        await browser.execute('flutter:waitFor', confirmPasswordLabel, 10000);
        await browser.execute('flutter:waitFor', createAccountBtn, 10000);
        console.log(' All structural fields are confirmed present on the UI!');
    });

    it('should enforce CAPTCHA verification before creating account', async () => {
        console.log('\n Checking for CAPTCHA anti-bot validation requirement...');
        const captchaChallenge = byText(locators.Auth.registerScreen.captchaChallenge);

        try {
            await browser.execute('flutter:waitFor', captchaChallenge, 3000);
            console.log('\n======================================================');
            console.log(' SUCCESS! Registration UI and Captcha standards verified!');
            console.log('======================================================\n');
        } catch (e) {
            throw new Error("UI REGRESSION: No CAPTCHA challenge or 'I am not a robot' element found on the registration form. Dev team missed requirement.");
        }
    });
});