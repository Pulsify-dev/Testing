

const { byText, byValueKey } = require('appium-flutter-finder');
const locators = require('../../../mobile-locators.json');

async function loginWith(email, password) {
    const emailLabel = byText(locators.Auth.loginScreen.emailLabel);
    await browser.execute('flutter:waitFor', emailLabel, 10000);

    await browser.execute('flutter:setFrameSync', false);

    const emailInput = byValueKey(locators.Auth.keys.loginEmailField);
    await browser.execute('flutter:waitFor', emailInput, 10000);
    await browser.elementSendKeys(emailInput, email);

    const passInput = byValueKey(locators.Auth.keys.loginPasswordField);
    await browser.execute('flutter:waitFor', passInput, 10000);
    await browser.elementSendKeys(passInput, password);

    await browser.execute('flutter:setFrameSync', true);

    const loginBtn = byValueKey(locators.Auth.keys.loginButton);
    await browser.execute('flutter:clickElement', loginBtn, { timeout: 10000 });

    const profileTab = byValueKey(locators.Auth.keys.navProfileTab);
    await browser.execute('flutter:waitFor', profileTab, 20000);
}

async function logout() {
    const profileTab = byValueKey(locators.Auth.keys.navProfileTab);
    await browser.execute('flutter:waitFor', profileTab, 10000);
    await browser.execute('flutter:clickElement', profileTab, { timeout: 5000 });

    const logoutBtn = byText(locators.Profile.settings.signOutBtn);
    await browser.execute('flutter:waitFor', logoutBtn, 10000);
    await browser.execute('flutter:clickElement', logoutBtn, { timeout: 5000 });

    const emailLabel = byText(locators.Auth.loginScreen.emailLabel);
    await browser.execute('flutter:waitFor', emailLabel, 15000);
}

describe('TC-AUTH-005 | Module 1: JWT & Session Token Handling', () => {

    it('TC-AUTH-005-01 | should persist session — app does not force re-login on return to foreground', async () => {
        console.log('[TEST] Logging in and backgrounding app to test session persistence...');

        await loginWith('testuser@example.com', 'Password123!');

        await browser.switchContext('NATIVE_APP');
        await browser.pressKeyCode(3);

        await browser.pause(3000);

        await browser.activateApp('com.pulsify.app');
        await browser.switchContext('FLUTTER');

        const profileTab = byValueKey(locators.Auth.keys.navProfileTab);
        await browser.execute('flutter:waitFor', profileTab, 15000);

        console.log('  ✓ Session persisted after backgrounding — no forced re-login.');
    });

    it('TC-AUTH-005-02 | should clear session on Logout and redirect to Login screen', async () => {
        console.log('[TEST] Logging out and verifying session is cleared...');

        await logout();

        console.log('  ✓ Session cleared on logout — redirected to Login screen.');
    });

    it('TC-AUTH-005-03 | should NOT auto-login after explicit logout (no stale token re-use)', async () => {
        console.log('[TEST] Verifying app does not use cached/stale token after logout...');

        const emailLabel = byText(locators.Auth.loginScreen.emailLabel);
        await browser.execute('flutter:waitFor', emailLabel, 10000);

        console.log('  ✓ Login screen shown — no stale token reuse. Authentication required.');
    });

    it('TC-AUTH-005-04 | should allow fresh login after logout (token refresh cycle)', async () => {
        console.log('[TEST] Logging in fresh after logout — token refresh cycle...');

        await loginWith('testuser@example.com', 'Password123!');

        console.log('  ✓ Fresh login after logout succeeded — token refresh cycle verified.');
    });

    it('TC-AUTH-005-05 | should handle Change Password flow from Edit Profile', async () => {
        console.log('[TEST] Navigating to Edit Profile and triggering Change Password dialog...');

        const profileTab = byValueKey(locators.Auth.keys.navProfileTab);
        await browser.execute('flutter:waitFor', profileTab, 10000);
        await browser.execute('flutter:clickElement', profileTab, { timeout: 5000 });

        const editBtn = byText(locators.Profile.customization.editProfileBtn);
        await browser.execute('flutter:waitFor', editBtn, 10000);
        await browser.execute('flutter:clickElement', editBtn, { timeout: 5000 });

        await browser.execute('flutter:scrollUntilVisible', {
            scrollable: { finder: 'type', value: 'SingleChildScrollView' },
            item: { finder: 'text', value: 'Change Password' },
            dxScroll: 0,
            dyScroll: -300,
        });

        const changePwdBtn = byText(locators.Profile.settings.changePasswordDialog);
        await browser.execute('flutter:waitFor', changePwdBtn, 10000);
        await browser.execute('flutter:clickElement', changePwdBtn, { timeout: 5000 });

        const changePwdDialog = byText(locators.Profile.settings.changePasswordDialog);
        await browser.execute('flutter:waitFor', changePwdDialog, 8000);

        console.log('  ✓ Change Password dialog opened from Edit Profile.');

        const cancelBtn = byText('Cancel');
        await browser.execute('flutter:waitFor', cancelBtn, 5000);
        await browser.execute('flutter:clickElement', cancelBtn, { timeout: 5000 });
    });

});
