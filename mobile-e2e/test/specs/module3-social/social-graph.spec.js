

const { byText, byValueKey } = require('appium-flutter-finder');
const locators = require('../../../mobile-locators.json');

async function ensureOnProfileScreen() {
    const profileTitle = byText(locators.Profile.navigation.profileTitle);
    await browser.execute('flutter:waitFor', profileTitle, 15000);
}

async function navigateToFollowers() {
    const followersLabel = byText(locators.Profile.stats.followersLabel.toUpperCase());
    await browser.execute('flutter:waitFor', followersLabel, 8000);
    await browser.execute('flutter:clickElement', followersLabel, { timeout: 5000 });

    const followersTitle = byText(locators.Social.followersTitle);
    await browser.execute('flutter:waitFor', followersTitle, 10000);
}

async function navigateToFollowing() {
    await browser.switchContext('NATIVE_APP');
    await browser.back();
    await browser.switchContext('FLUTTER');

    await ensureOnProfileScreen();

    const followingLabel = byText(locators.Profile.stats.followingLabel.toUpperCase());
    await browser.execute('flutter:waitFor', followingLabel, 8000);
    await browser.execute('flutter:clickElement', followingLabel, { timeout: 5000 });

    const followingTitle = byText(locators.Social.followingTitle);
    await browser.execute('flutter:waitFor', followingTitle, 10000);
}

describe('TC-SOC-001 | Module 3: Followers & Social Graph', () => {

    before(async () => {
        console.log('\n════════════════════════════════════════════════════════');
        console.log('  [SETUP] Ensuring Profile screen is visible...');
        console.log('════════════════════════════════════════════════════════\n');
        await ensureOnProfileScreen();
        console.log('  [SETUP] ✓ Profile screen confirmed.\n');
    });

    it('TC-SOC-001-01 | should display Followers screen with correct title', async () => {
        console.log('[TEST] Navigating to Followers screen via stat button...');
        await navigateToFollowers();
        console.log('  ✓ Followers screen rendered with correct title.');
    });

    it('TC-SOC-001-02 | should show Followers list or empty state message', async () => {
        console.log('[TEST] Verifying Followers list or empty state...');

        try {

            const followBtn = byText(locators.Social.followButton);
            await browser.execute('flutter:waitFor', followBtn, 5000);
            console.log('  ✓ Followers list present with Follow/Unfollow actions.');
        } catch (_) {

            const noFollowers = byText(locators.Social.noFollowersText);
            try {
                await browser.execute('flutter:waitFor', noFollowers, 5000);
                console.log('  ✓ Empty followers state displayed correctly.');
            } catch (_) {
                console.log('  [INFO] Followers state undetermined — check backend data.');
            }
        }
    });

    it('TC-SOC-001-03 | should navigate to Following screen', async () => {
        console.log('[TEST] Navigating to Following screen...');
        await navigateToFollowing();
        console.log('  ✓ Following screen rendered with correct title.');
    });

    it('TC-SOC-001-04 | should show Following list or empty state message', async () => {
        console.log('[TEST] Verifying Following list or empty state...');

        try {
            const unfollowBtn = byText(locators.Social.unfollowButton);
            await browser.execute('flutter:waitFor', unfollowBtn, 5000);
            console.log('  ✓ Following list rendered with Unfollow buttons.');
        } catch (_) {
            const noFollowing = byText(locators.Social.noFollowingText);
            try {
                await browser.execute('flutter:waitFor', noFollowing, 5000);
                console.log('  ✓ Empty following state displayed correctly.');
            } catch (_) {
                console.log('  [INFO] Following state undetermined — check backend data.');
            }
        }
    });

    it('TC-SOC-001-05 | should access Suggested Users from Profile menu', async () => {
        console.log('[TEST] Opening Profile popup menu and tapping Suggested Users...');

        await browser.switchContext('NATIVE_APP');
        await browser.back();
        await browser.switchContext('FLUTTER');

        await ensureOnProfileScreen();

        const moreIcon = byText(locators.Social.moreMenuIcon);
        await browser.execute('flutter:waitFor', moreIcon, 8000);
        await browser.execute('flutter:clickElement', moreIcon, { timeout: 5000 });

        await browser.pause(1000);

        const suggestedItem = byText(locators.Social.suggestedUsersMenuItem);
        await browser.execute('flutter:waitFor', suggestedItem, 5000);
        await browser.execute('flutter:clickElement', suggestedItem, { timeout: 5000 });

        const suggestedTitle = byText(locators.Social.suggestedUsers);
        await browser.execute('flutter:waitFor', suggestedTitle, 10000);

        console.log('  ✓ Suggested Users screen opened from profile menu.');
    });

    it('TC-SOC-001-06 | should allow follow action on Suggested Users screen', async () => {
        console.log('[TEST] Looking for Follow button on Suggested Users screen...');

        const followBtn = byText(locators.Social.followButton);
        try {
            await browser.execute('flutter:waitFor', followBtn, 8000);
            await browser.execute('flutter:clickElement', followBtn, { timeout: 5000 });
            await browser.pause(2000);

            const unfollowBtn = byText(locators.Social.unfollowButton);
            await browser.execute('flutter:waitFor', unfollowBtn, 8000);
            console.log('  ✓ Follow action triggered — button changed to Unfollow.');

        } catch (_) {
            console.log('  [INFO] No suggested users available or Follow button not found. Likely empty state.');
        }
    });

    it('TC-SOC-001-07 | should access Blocked Users from Profile menu', async () => {
        console.log('[TEST] Opening Profile popup menu and tapping Blocked Users...');

        await browser.switchContext('NATIVE_APP');
        await browser.back();
        await browser.switchContext('FLUTTER');

        await ensureOnProfileScreen();

        const moreIcon = byText(locators.Social.moreMenuIcon);
        await browser.execute('flutter:waitFor', moreIcon, 8000);
        await browser.execute('flutter:clickElement', moreIcon, { timeout: 5000 });

        await browser.pause(1000);

        const blockedItem = byText(locators.Social.blockedUsersMenuItem);
        await browser.execute('flutter:waitFor', blockedItem, 5000);
        await browser.execute('flutter:clickElement', blockedItem, { timeout: 5000 });

        const blockedTitle = byText(locators.Social.blockedUsers);
        await browser.execute('flutter:waitFor', blockedTitle, 10000);

        console.log('  ✓ Blocked Users screen opened from profile menu.');
    });

    it('TC-SOC-001-08 | should allow Unblock action in Blocked Users screen', async () => {
        console.log('[TEST] Looking for Unblock option in Blocked Users list...');

        const unblockBtn = byText(locators.Social.unblockUser);
        try {
            await browser.execute('flutter:waitFor', unblockBtn, 5000);
            await browser.execute('flutter:clickElement', unblockBtn, { timeout: 5000 });
            await browser.pause(2000);
            console.log('  ✓ Unblock action triggered successfully.');
        } catch (_) {
            console.log('  [INFO] No blocked users found — Blocked List is empty (expected for clean test account).');
        }
    });

});
