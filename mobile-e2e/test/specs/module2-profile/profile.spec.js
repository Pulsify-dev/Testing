const { byValueKey, byType } = require('appium-flutter-finder');

describe('Module 2: User Profile - TRUE AUTOMATION', () => {
    it('should complete flow to Edit Profile', async () => {
        console.log('\n======================================================');
        console.log(' Starting Profile & Edit UI Automation Test...');
        console.log('======================================================\n');

        console.log(' Looking for Login Input...');
        const loginEmailField = byType('TextFormField');
        await driver.execute('flutter:waitFor', loginEmailField, 5000);

        console.log(' Logging in to access Profile Tab (Assuming App uses cached state for Profile Tab or awaits navigation)...');
        const profileTab = byValueKey('nav_profile_tab');
        await driver.execute('flutter:waitFor', profileTab, 20000);

        console.log(' Navigating to Profile Tab...');
        await driver.execute('flutter:clickElement', profileTab, { timeout: 5000 });

        console.log(' Waiting for UserProfileScreen to render...');
        const profileScreen = byType('UserProfileScreen');
        await driver.execute('flutter:waitFor', profileScreen, 15000);

        console.log(' Clicking Edit Profile Button...');
        const editProfileBtn = byValueKey('edit_profile_button');
        await driver.execute('flutter:waitFor', editProfileBtn, 5000);
        await driver.execute('flutter:clickElement', editProfileBtn, { timeout: 5000 });
        console.log(' Edit Profile action fired safely.');
    });

    it('should check for missing UI strictly', async () => {
        console.log(' Verifying transition to EditProfileScreen...');
        const editProfileScreen = byType('EditProfileScreen');
        await driver.execute('flutter:waitFor', editProfileScreen, 5000);

        console.log(' Checking that Location input field exists...');
        const locationField = byValueKey('location_input_field');
        await driver.execute('flutter:waitFor', locationField, 3000);

        console.log('\n======================================================');
        console.log(' SUCCESS! Profile module components are fully verified!');
        console.log('======================================================\n');
    });
});
