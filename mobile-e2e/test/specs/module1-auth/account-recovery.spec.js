const { byText } = require('appium-flutter-finder');
const locators = require('../../../mobile-locators.json');

describe('Module 1: Authentication - Account Recovery', () => {
    it('should navigate to password reset from login screen', async () => {
        console.log('\n======================================================');
        console.log(' Starting Forgot Password Automation Test...');
        console.log('======================================================\n');

        // Appium needs elements to be laid out, so we wait for "Forgot Password" or similar text
        const forgotPasswordLink = byText('Forgot Password?');
        console.log(' Searching for "Forgot Password?" button...');

        try {
            await browser.execute('flutter:waitFor', forgotPasswordLink, 5000);
            console.log(' Clicking "Forgot Password?" link...');
            await browser.execute('flutter:clickElement', forgotPasswordLink, { timeout: 5000 });
            console.log('\n======================================================');
            console.log(' SUCCESS! Found and executed Account Recovery flow.');
            console.log('======================================================\n');
        } catch (e) {
            console.log(" Forgot Password link not found on UI yet - logging failure for report.");
            throw e;
        }
    });
});
