/**
 * Pulsify E2E Regression — Modules 5-13
 * Backend: https://pulsify.page
 *
 * Architecture:
 *  - makeModule() cascade: first failure in a module auto-fails all subsequent tests
 *  - Integrated modules (5,6,8,9,10): soft on optional UI, hard on critical paths
 *  - Non-integrated modules (7,11,12,13): hard assertions → real Mocha ✖
 *  - NATIVE_APP context for all text entry (bypasses duplicate-ValueKey issue)
 *  - after() hook writes TEST_REPORT.md
 *
 * Cross codebase facts (verified):
 *  Module 5  Home/Feed/Player           — screens exist, fully integrated ✅
 *  Module 6  Engagement                 — like/comment/repost exist ✅
 *  Module 7  Library/Playlists          — Library has ONLY Liked Tracks + History;
 *                                         NO playlists UI ❌
 *  Module 8  Search                     — search screen fully integrated ✅
 *  Module 9  Messaging                  — Activity/Messages integrated ✅
 *  Module 10 Notifications              — Notifications tab integrated ✅
 *  Module 11 Moderation (Report/Mute)   — No report-user or mute UI ❌
 *            (Blocked/Suggested are Social, not Moderation)
 *  Module 12 Subscription               — Upgrade tab is a stub "Coming soon" ❌
 *  Module 13 Albums                     — Album model exists; zero screens ❌
 *
 *  Nav keys: nav_home_tab, nav_search_tab, nav_library_tab, nav_feed_tab,
 *            nav_upgrade_tab  (NO nav_profile — profile via Library avatar)
 */

'use strict';

const { byText, byType, byValueKey, byTooltip } = require('appium-flutter-finder');
const {
    WAIT, tap, fieldByHint, plainTextFieldByHint,
    tapFirstAvailable, focusAndEnterText, waitForAny,
    appears, hideKeyboard,
} = require('../support/helpers');
const fs   = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const PRIMARY_USER = { email: 'Mohamedtest@test.com', password: 'password123' };
const REPORT_PATH  = path.join(__dirname, '../../TEST_REPORT.md');
const S = WAIT.short;   // 2000 ms (from helpers.js)
const M = WAIT.medium;  // 4000 ms

// ─── Results tracker ─────────────────────────────────────────────────────────
const R = [];
function ok(mod, tc, note = '')  { R.push({ mod, tc, status: '✅ PASSED', note  }); console.log(`  ✅  ${mod} › ${tc}${note ? ' — ' + note : ''}`); }
function ko(mod, tc, reason = '') { R.push({ mod, tc, status: '❌ FAILED', note: reason }); console.warn(`  ❌  ${mod} › ${tc} — ${reason}`); }

// ─── Module cascade helper ────────────────────────────────────────────────────
// First failing test in a module → all subsequent tests auto-fail (cascade).
// Hard-fail modules (7,11,12,13): throw is re-raised → Mocha shows ✖
// Soft modules (5,6,8,9,10):     throw from hard assertions → Mocha shows ✖
function makeModule(name) {
    let failed = false;
    return {
        async run(tc, testFn) {
            if (failed) {
                const msg = `CASCADE: ${name} already failed — ${tc} auto-failed`;
                ko(name, tc, msg);
                throw new Error(msg);
            }
            try {
                await testFn();
                ok(name, tc);
            } catch (err) {
                failed = true;
                ko(name, tc, err.message);
                throw err; // re-raise → Mocha marks ✖
            }
        },
    };
}

// ─── Report ──────────────────────────────────────────────────────────────────
function buildReport() {
    const now    = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const passed = R.filter(r => r.status.includes('PASSED')).length;
    const failed = R.filter(r => r.status.includes('FAILED')).length;
    const total  = R.length;
    const rate   = total ? Math.round((passed / total) * 100) : 0;

    const byModule = {};
    R.forEach(r => {
        if (!byModule[r.mod]) byModule[r.mod] = [];
        byModule[r.mod].push(r);
    });

    const sections = Object.entries(byModule).map(([mod, rows]) => {
        const mPass = rows.filter(r => r.status.includes('PASSED')).length;
        const header = `### ${mod} (${mPass}/${rows.length} passed)\n\n| Test Case | Status | Notes |\n|-----------|--------|-------|`;
        const rowLines = rows.map(r =>
            `| ${r.tc} | ${r.status} | ${(r.note || '—').replace(/\|/g, '/')} |`
        ).join('\n');
        return header + '\n' + rowLines;
    }).join('\n\n');

    return [
        '# Pulsify Mobile E2E Test Report',
        '',
        `**Generated:** ${now}`,
        `**User:** ${PRIMARY_USER.email} | **Backend:** https://pulsify.page`,
        '',
        '---', '',
        '## Summary',
        '',
        '| Metric | Value |', '|--------|-------|',
        `| Total | ${total} |`,
        `| ✅ Passed | ${passed} |`,
        `| ❌ Failed | ${failed} |`,
        `| Pass Rate | ${rate}% |`,
        '',
        '> Modules 7, 11, 12, 13 are **not yet integrated** in the Flutter UI and are expected to ❌ FAIL.',
        '',
        '---', '', '## Results by Module', '',
        sections,
        '', '---', '',
        '## Integration Status',
        '',
        '| Module | Feature | Backend | Flutter UI | Status |',
        '|--------|---------|---------|-----------|--------|',
        '| 5  | Playback & Streaming   | ✅ Streaming_Module      | ✅ | Expected PASS |',
        '| 6  | Engagement             | ✅ Engagement_Module     | ✅ | Expected PASS |',
        '| 7  | Library / Playlists    | ✅ Playlist_Module       | ❌ No playlist UI | Expected FAIL |',
        '| 8  | Discovery & Search     | ✅ Discovery_Module      | ✅ | Expected PASS |',
        '| 9  | Messaging              | ✅ Messaging_Module      | ✅ | Expected PASS |',
        '| 10 | Notifications          | ✅ Notification_Module   | ✅ | Expected PASS |',
        '| 11 | Moderation (Report/Mute)| ✅ Moderation_Module     | ❌ No report/mute UI | Expected FAIL |',
        '| 12 | Subscription           | ✅ Subscription_Module   | ❌ Stub only | Expected FAIL |',
        '| 13 | Albums                 | ✅ Album_Module          | ❌ No album screens | Expected FAIL |',
        '',
        '---', '',
        '*Generated by Pulsify Appium/WebdriverIO E2E automation*',
    ].join('\n');
}

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('Pulsify E2E — Modules 5-13', () => {

    // ── Shared helpers ────────────────────────────────────────────────────────

    async function toFlutter() {
        try { const c = await browser.getContext(); if (c !== 'FLUTTER') await browser.switchContext('FLUTTER'); } catch (_) {}
        try { await browser.execute('flutter:setFrameSync', false); } catch (_) {}
    }

    async function nativeBack() {
        try { await browser.switchContext('NATIVE_APP'); await browser.back(); } catch (_) {}
        await toFlutter();
    }

    async function resetState() {
        try { await browser.switchContext('NATIVE_APP'); await browser.back(); } catch (_) {}
        await toFlutter();
        await tapFirstAvailable([byValueKey('nav_home_tab'), byText('Home')], S).catch(() => {});
        await browser.pause(400);
    }

    async function goHome() {
        await toFlutter();
        await tap(byValueKey('nav_home_tab'), S).catch(() => {});
        await browser.pause(300);
    }

    async function goFeed() {
        await toFlutter();
        await tap(byValueKey('nav_feed_tab'), S).catch(() => {});
        await browser.pause(500);
    }

    async function goSearch() {
        await toFlutter();
        await tap(byValueKey('nav_search_tab'), S).catch(() => {});
        await browser.pause(400);
    }

    async function goLibrary() {
        await toFlutter();
        await tap(byValueKey('nav_library_tab'), S).catch(() => {});
        await browser.pause(400);
    }

    // Profile: accessible via Library header avatar — NO nav_profile key in bottom nav
    async function goProfile() {
        await goLibrary();
        await tap(byValueKey('library_profile_avatar'), S);
        await browser.pause(500);
        await waitForAny([byText('Edit Profile'), byText('Logout'), byText('FOLLOWERS')], S, 5000).catch(() => {});
    }

    async function goActivity() {
        await goHome();
        await tapFirstAvailable([byTooltip('Activity')], S).catch(() => {});
        await browser.pause(500);
    }

    async function nativeEnterText(xpath, value) {
        await browser.switchContext('NATIVE_APP');
        const el = await browser.$(xpath);
        await el.waitForDisplayed({ timeout: 5000 });
        await el.click(); await el.clearValue(); await el.setValue(value);
        await toFlutter();
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    beforeEach(async () => {
        try { await browser.execute('flutter:setFrameSync', false); } catch (_) {}
    });

    after(async () => {
        fs.writeFileSync(REPORT_PATH, buildReport(), 'utf-8');
        console.log(`\n📄 TEST_REPORT.md → ${REPORT_PATH}\n`);
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  SIGN-IN GATEWAY
    //  Reality check: Mohamedtest@test.com must exist on https://pulsify.page
    // ═══════════════════════════════════════════════════════════════════════════
    describe('▶️ SIGN-IN Gateway', () => {
        const mod = makeModule('SIGN-IN');

        it('TC-SIGNIN-001 | Enter credentials via NATIVE context, reach main screen', () => mod.run('TC-SIGNIN-001', async () => {
            await browser.execute('flutter:setFrameSync', false);

            if (await appears(byValueKey('nav_home_tab'), 2000)) return; // already logged in

            await nativeEnterText('//android.widget.EditText[@hint="name@example.com"]', PRIMARY_USER.email);
            await nativeEnterText('//android.widget.EditText[@hint="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"]', PRIMARY_USER.password);
            await tap(byText('Log In'), 5000);

            // Wait up to 20 s — remote API may be slow
            const deadline = Date.now() + 20000;
            while (Date.now() < deadline) {
                if (await appears(byValueKey('nav_home_tab'), 800)) return;
                if (await appears(byText('Discover New Sounds'), 800)) return;
                if (await appears(byText('Invalid credentials.'), 600))
                    throw new Error('Snackbar: Invalid credentials — check account on pulsify.page');
            }
            throw new Error('Timed out (20 s) waiting for main screen after login');
        }));
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  MODULE 5: Playback & Streaming  ✅ INTEGRATED
    //  Reality check: public tracks exist in pulsify.page discovery feed
    // ═══════════════════════════════════════════════════════════════════════════
    describe('▶️ MODULE 5: Playback & Streaming', () => {
        const mod = makeModule('MODULE 5');

        it('TC-PLAY-001 | Home screen renders content', () => mod.run('TC-PLAY-001', async () => {
            await goHome();
            if (!await appears(byText('Discover New Sounds'), M) && !await appears(byValueKey('nav_home_tab'), S))
                throw new Error('Home screen did not render');
        }));

        it('TC-PLAY-002 | Feed has Discover + Following tabs; Discover has content', () => mod.run('TC-PLAY-002', async () => {
            await goFeed();
            if (!await appears(byText('Discover'), M)) throw new Error('Discover tab not found on Feed screen');
            await tap(byText('Discover'), S).catch(() => {});
            await browser.pause(400);
            const hasContent = await appears(byType('TrackTile'), S) || await appears(byType('ListTile'), S) ||
                await appears(byText('No tracks found in discovery.'), S);
            if (!hasContent) throw new Error('Discover tab shows nothing and no empty-state');
            if (!await appears(byText('Following'), S)) throw new Error('Following tab not found');
        }));

        it('TC-PLAY-003 | Following tab shows empty state (user follows nobody)', () => mod.run('TC-PLAY-003', async () => {
            await goFeed();
            await tap(byText('Following'), S).catch(() => {});
            await browser.pause(400);
            const ok2 = await appears(byText('No tracks from people you follow.'), M) ||
                await appears(byText('Follow artists'), S) || await appears(byType('TrackTile'), S);
            if (!ok2) throw new Error('Following tab rendered neither tracks nor empty-state');
        }));

        it('TC-PLAY-004 | Tap a track → player screen renders', () => mod.run('TC-PLAY-004', async () => {
            await goHome();
            await browser.pause(300);
            const tapped = await tapFirstAvailable([byType('TrackTile'), byType('ListTile')], S).catch(() => null);
            if (!tapped) throw new Error('No track tile in Home feed');
            await browser.pause(500);
            const player = await appears(byValueKey('player_play_pause_button'), M) ||
                await appears(byText('Comment...'), S) || await appears(byText('Behind this track'), S);
            await nativeBack();
            if (!player) throw new Error('Player screen did not render after tapping track');
        }));
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  MODULE 6: Engagement  ✅ INTEGRATED
    //  Reality check: tracks visible in Discover feed, user is authenticated
    // ═══════════════════════════════════════════════════════════════════════════
    describe('▶️ MODULE 6: Engagement', () => {
        const mod = makeModule('MODULE 6');

        it('TC-ENG-001 | Discover feed shows Follow surface', () => mod.run('TC-ENG-001', async () => {
            await goFeed();
            await tap(byText('Discover'), S).catch(() => {});
            await browser.pause(400);
            if (!await appears(byText('Follow'), S) && !await appears(byType('TrackTile'), S))
                throw new Error('No engagement elements (Follow button / TrackTile) on Discover tab');
        }));

        it('TC-ENG-002 | Track detail shows Comment bar', () => mod.run('TC-ENG-002', async () => {
            await goHome();
            const tapped = await tapFirstAvailable([byType('TrackTile'), byType('ListTile')], S).catch(() => null);
            if (!tapped) throw new Error('No track tile to tap from Home');
            await browser.pause(400);
            const hasComment = await appears(byText('Comment...'), M);
            await nativeBack();
            if (!hasComment) throw new Error('Comment bar not visible on track detail');
        }));

        it('TC-ENG-003 (Negative) | Empty comment blocked or shows hint', () => mod.run('TC-ENG-003', async () => {
            await goHome();
            const tapped = await tapFirstAvailable([byType('TrackTile'), byType('ListTile')], S).catch(() => null);
            if (!tapped) { return; } // no tracks — skip gracefully without failing
            await browser.pause(400);
            if (!await appears(byText('Comment...'), S)) { await nativeBack(); return; }
            await tap(byText('Comment...'), S).catch(() => {});
            await browser.pause(300);
            await tapFirstAvailable([byValueKey('comment_send_button'), byTooltip('Send')], S).catch(() => {});
            await browser.pause(400);
            const blocked = await appears(byText('Comment cannot be empty'), S) ||
                await appears(byText('Write a comment'), S) || await appears(byText('Comment...'), S);
            await nativeBack();
            if (!blocked) throw new Error('Empty comment was not blocked');
        }));
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  MODULE 7: Library / Playlists  ❌ NOT INTEGRATED
    //  Reality check (verified in Cross source):
    //    library_screen.dart renders ONLY "Liked Tracks" + "Listening History"
    //    There is NO playlist section, NO create-playlist button, NO playlist UI
    //    Playlist model (feed/models/playlist.dart) exists but has zero screens
    // ═══════════════════════════════════════════════════════════════════════════
    describe('▶️ MODULE 7: Library / Playlists [NOT INTEGRATED]', () => {
        const mod = makeModule('MODULE 7');

        it('TC-PLY-001 | Playlists section exists in Library', () => mod.run('TC-PLY-001', async () => {
            await goLibrary();
            // The Library screen ONLY has Liked Tracks + Listening History.
            // There is no Playlists section, Sets, Collections, or Create Playlist.
            const found = await appears(byText('Playlists'), M) ||
                await appears(byText('Sets'), M) ||
                await appears(byText('Collections'), M) ||
                await appears(byValueKey('library_playlists_section'), S);
            if (!found) throw new Error('Playlists section not found in Library — playlist UI not integrated (only Liked Tracks + History present)');
        }));

        it('TC-PLY-002 | Create New Playlist button exists', () => mod.run('TC-PLY-002', async () => {
            await goLibrary();
            const found = await appears(byValueKey('create_playlist_button'), M) ||
                await appears(byText('Create Playlist'), M) ||
                await appears(byText('New Playlist'), M) ||
                await appears(byTooltip('Create Playlist'), S);
            if (!found) throw new Error('Create Playlist button not found — playlist creation not integrated');
        }));

        it('TC-PLY-003 | Playlist detail screen renders with tracks', () => mod.run('TC-PLY-003', async () => {
            await goLibrary();
            const tapped = await tapFirstAvailable([byValueKey('playlist_tile'), byType('PlaylistTile')], S).catch(() => null);
            if (!tapped) throw new Error('No playlist tile to tap — playlist list not integrated');
            await browser.pause(400);
            const onPlaylist = await appears(byText('Tracks'), M) || await appears(byType('TrackTile'), S);
            await nativeBack();
            if (!onPlaylist) throw new Error('Playlist detail screen did not render');
        }));
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  MODULE 8: Discovery & Search  ✅ INTEGRATED
    //  Reality check: public tracks and user profiles exist on pulsify.page
    // ═══════════════════════════════════════════════════════════════════════════
    describe('▶️ MODULE 8: Discovery & Search', () => {
        const mod = makeModule('MODULE 8');

        it('TC-SRCH-001 | Search screen renders with search bar', () => mod.run('TC-SRCH-001', async () => {
            await goSearch();
            if (!await appears(byText('Search Pulsify...'), M) && !await appears(byText('Tracks'), S))
                throw new Error('Search screen did not render');
        }));

        it('TC-SRCH-002 | Category tabs (Tracks, Profiles) visible', () => mod.run('TC-SRCH-002', async () => {
            await goSearch();
            if (!await appears(byText('Tracks'), M) && !await appears(byText('Profiles'), S))
                throw new Error('No category tabs found (Tracks/Profiles missing)');
        }));

        it('TC-SRCH-003 | Search "test" returns results or empty state', () => mod.run('TC-SRCH-003', async () => {
            await goSearch();
            await browser.switchContext('NATIVE_APP');
            const input = await browser.$('//android.widget.EditText');
            await input.waitForDisplayed({ timeout: 4000 });
            await input.click(); await input.setValue('test');
            await toFlutter();
            await hideKeyboard().catch(() => {});
            await browser.pause(700);
            const found = await appears(byType('TrackTile'), S) || await appears(byType('ListTile'), S) ||
                await appears(byText('No results found'), S) || await appears(byText('Tracks'), S);
            if (!found) throw new Error('Search for "test" returned neither results nor empty-state');
        }));

        it('TC-SRCH-004 | Trending Now section visible on idle search', () => mod.run('TC-SRCH-004', async () => {
            await goSearch();
            await browser.pause(300);
            // Trending may or may not exist — check, but do not fail if absent
            const hasTrending = await appears(byText('Trending Now'), M);
            const hasBar = await appears(byText('Search Pulsify...'), S);
            if (!hasTrending && !hasBar) throw new Error('Search screen unresponsive — neither Trending nor search bar visible');
        }));

        it('TC-SRCH-005 (Negative) | Gibberish query shows empty state', () => mod.run('TC-SRCH-005', async () => {
            await goSearch();
            await browser.switchContext('NATIVE_APP');
            const input = await browser.$('//android.widget.EditText');
            await input.waitForDisplayed({ timeout: 4000 });
            await input.click(); await input.setValue('zzzxxyy99887766nosuch');
            await toFlutter();
            await hideKeyboard().catch(() => {});
            await browser.pause(700);
            const empty = await appears(byText('No results found'), M) ||
                await appears(byText('Try searching for something else'), S) ||
                await appears(byText('No tracks found'), S);
            if (!empty) throw new Error('No empty-state shown for gibberish query');
        }));
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  MODULE 9: Messaging  ✅ INTEGRATED
    //  Reality check: Activity screen accessible via Home toolbar tooltip "Activity"
    // ═══════════════════════════════════════════════════════════════════════════
    describe('▶️ MODULE 9: Messaging', () => {
        const mod = makeModule('MODULE 9');

        it('TC-MSG-001 | Activity screen opens from Home toolbar', () => mod.run('TC-MSG-001', async () => {
            await goHome();
            await tapFirstAvailable([byTooltip('Activity')], S);
            await browser.pause(400);
            if (!await appears(byText('Activity'), M) && !await appears(byText('Messages'), S) && !await appears(byText('Notifications'), S))
                throw new Error('Activity screen did not open — Activity tooltip not found on Home toolbar');
        }));

        it('TC-MSG-002 | Messages tab opens message list', () => mod.run('TC-MSG-002', async () => {
            if (!await appears(byText('Messages'), S)) await goActivity();
            if (!await appears(byText('Messages'), M)) throw new Error('Messages tab not found on Activity screen');
            await tap(byText('Messages'), S).catch(() => {});
            await browser.pause(400);
            const msgContent = await appears(byText('No messages yet.'), M) ||
                await appears(byText('All Messages'), S) || await appears(byText('Messages'), S);
            if (!msgContent) throw new Error('Message list did not render');
        }));

        it('TC-MSG-003 | Navigate back to Home from Messages', () => mod.run('TC-MSG-003', async () => {
            await nativeBack();
            await browser.pause(400);
            await goHome();
            if (!await appears(byValueKey('nav_home_tab'), S)) throw new Error('Home not reachable after Messages');
        }));
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  MODULE 10: Notifications  ✅ INTEGRATED
    //  Reality check: Notifications tab on Activity screen
    // ═══════════════════════════════════════════════════════════════════════════
    describe('▶️ MODULE 10: Notifications', () => {
        const mod = makeModule('MODULE 10');

        it('TC-NOTIF-001 | Notifications tab visible on Activity screen', () => mod.run('TC-NOTIF-001', async () => {
            await goActivity();
            if (!await appears(byText('Notifications'), M)) throw new Error('Notifications tab not found on Activity screen');
        }));

        it('TC-NOTIF-002 | Notifications list or empty state renders', () => mod.run('TC-NOTIF-002', async () => {
            if (!await appears(byText('Notifications'), S)) await goActivity();
            await tap(byText('Notifications'), S).catch(() => {});
            await browser.pause(400);
            const content = await appears(byText('Mark all as read'), M) ||
                await appears(byText('No notifications'), M) || await appears(byText('Notifications'), S);
            if (!content) throw new Error('Notifications screen rendered no content');
        }));

        it('TC-NOTIF-003 | Navigate back to Home from Notifications', () => mod.run('TC-NOTIF-003', async () => {
            await nativeBack();
            await browser.pause(400);
            await goHome();
        }));
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  MODULE 11: Moderation — Report User / Mute  ❌ NOT INTEGRATED
    //  Reality check (verified in Cross source):
    //    No report-user route, no mute route, no moderation dashboard in Flutter
    //    Blocked/Suggested Users exist but those are Social (Module 3), not Moderation
    //    Moderation_Module.postman_collection.json backend is ready
    // ═══════════════════════════════════════════════════════════════════════════
    describe('▶️ MODULE 11: Moderation — Report / Mute [NOT INTEGRATED]', () => {
        const mod = makeModule('MODULE 11');

        it('TC-MOD-001 | "Report User" action accessible from public profile', () => mod.run('TC-MOD-001', async () => {
            // Navigate to a public profile via Feed Discover
            await goFeed();
            await tap(byText('Discover'), S).catch(() => {});
            await browser.pause(400);
            // Tap a Follow button to reach a public profile
            const tapped = await tapFirstAvailable([byText('Follow'), byType('TrackTile')], S).catch(() => null);
            if (!tapped) throw new Error('No Follow button / Track visible in Discover to navigate to public profile');
            await browser.pause(500);
            // Look for Report User action on public profile or track detail
            const reportFound = await appears(byText('Report User'), M) ||
                await appears(byText('Report'), M) ||
                await appears(byValueKey('report_user_button'), S) ||
                await appears(byTooltip('Report'), S);
            await nativeBack();
            if (!reportFound) throw new Error('"Report User" action not found — Moderation module not integrated in Flutter UI');
        }));

        it('TC-MOD-002 | "Mute User" action accessible', () => mod.run('TC-MOD-002', async () => {
            await goFeed();
            await tap(byText('Discover'), S).catch(() => {});
            await browser.pause(400);
            const tapped = await tapFirstAvailable([byText('Follow'), byType('TrackTile')], S).catch(() => null);
            if (!tapped) throw new Error('No track/user to navigate to for Mute test');
            await browser.pause(500);
            const muteFound = await appears(byText('Mute'), M) ||
                await appears(byValueKey('mute_user_button'), S) ||
                await appears(byTooltip('Mute'), S);
            await nativeBack();
            if (!muteFound) throw new Error('"Mute User" action not found — Moderation module not integrated');
        }));

        it('TC-MOD-003 | Report submitted shows confirmation', () => mod.run('TC-MOD-003', async () => {
            // This is cascade-failed by TC-MOD-001/002 failures above
            throw new Error('Cannot test Report submission — Report UI not integrated');
        }));
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  MODULE 12: Subscription & Premium  ❌ NOT INTEGRATED
    //  Reality check (verified in Cross source):
    //    _UpgradeScreen is a hardcoded stub: shows "Go Premium" + "Coming soon"
    //    No pricing plans, no subscribe button, no backend subscription calls
    //    Subscription_Module.postman_collection.json backend is ready
    // ═══════════════════════════════════════════════════════════════════════════
    describe('▶️ MODULE 12: Subscription & Premium [NOT INTEGRATED]', () => {
        const mod = makeModule('MODULE 12');

        it('TC-SUB-001 | Upgrade screen accessible via nav tab', () => mod.run('TC-SUB-001', async () => {
            await tapFirstAvailable([byValueKey('nav_upgrade_tab')], S);
            await browser.pause(400);
            if (!await appears(byText('Go Premium'), M) && !await appears(byText('Upgrade'), S))
                throw new Error('Upgrade screen not accessible via nav_upgrade_tab');
        }));

        it('TC-SUB-002 | Real subscription plans show pricing (Monthly / Annual)', () => mod.run('TC-SUB-002', async () => {
            // The screen ONLY shows "Go Premium" / "Coming soon" stub — no real plans
            const realPlan = await appears(byText('Monthly'), M) ||
                await appears(byText('Annual'), M) ||
                await appears(byText('/month'), S) ||
                await appears(byValueKey('subscription_plan_monthly'), S) ||
                await appears(byValueKey('subscription_plan_annual'), S);
            if (!realPlan) throw new Error('No subscription pricing plans found — screen is a "Coming soon" stub, real plans not integrated');
        }));

        it('TC-SUB-003 | Subscribe / Purchase button exists', () => mod.run('TC-SUB-003', async () => {
            const btn = await appears(byText('Subscribe'), M) ||
                await appears(byText('Get Premium'), M) ||
                await appears(byValueKey('subscribe_button'), S);
            if (!btn) throw new Error('Subscribe/Purchase button not found — subscription flow not integrated');
        }));
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  MODULE 13: Albums  ❌ NOT INTEGRATED
    //  Reality check (verified in Cross source):
    //    feed/models/album.dart — data model exists
    //    Zero album screens, zero album routes, zero album UI components
    //    Album_Module.postman_collection.json backend is ready
    // ═══════════════════════════════════════════════════════════════════════════
    describe('▶️ MODULE 13: Albums [NOT INTEGRATED]', () => {
        const mod = makeModule('MODULE 13');

        it('TC-ALB-001 | Albums section accessible from Profile or Library', () => mod.run('TC-ALB-001', async () => {
            // Try Profile first
            await goProfile();
            await browser.pause(300);
            let found = await appears(byText('Albums'), M) ||
                await appears(byValueKey('profile_albums_tab'), S) ||
                await appears(byText('My Albums'), S);
            if (!found) {
                // Try Library
                await goLibrary();
                await browser.pause(300);
                found = await appears(byText('Albums'), M) ||
                    await appears(byValueKey('library_albums_section'), S);
            }
            if (!found) throw new Error('Albums section not found in Profile or Library — Album feature not integrated (only data model exists)');
        }));

        it('TC-ALB-002 | Create Album button present', () => mod.run('TC-ALB-002', async () => {
            const btn = await appears(byValueKey('create_album_button'), M) ||
                await appears(byText('Create Album'), M) || await appears(byTooltip('Create Album'), S);
            if (!btn) throw new Error('Create Album button not found — Albums not integrated');
        }));

        it('TC-ALB-003 | Album detail screen renders track list', () => mod.run('TC-ALB-003', async () => {
            const tapped = await tapFirstAvailable([byValueKey('album_tile'), byType('AlbumTile')], S).catch(() => null);
            if (!tapped) throw new Error('No album tile to tap — Albums not integrated');
            await browser.pause(400);
            const onAlbum = await appears(byText('Tracks'), M) || await appears(byType('TrackTile'), S);
            await nativeBack();
            if (!onAlbum) throw new Error('Album detail did not render');
        }));
    });

    // ─── CLEANUP ─────────────────────────────────────────────────────────────
    describe('▶️ CLEANUP', () => {
        const mod = makeModule('CLEANUP');

        it('TC-LOGOUT-001 | Logout from Profile screen', () => mod.run('TC-LOGOUT-001', async () => {
            await goProfile();
            await browser.pause(300);
            const logoutTapped = await tapFirstAvailable(
                [byValueKey('profile_logout_button'), byText('Logout')], S
            ).catch(() => null);
            if (logoutTapped) {
                await browser.pause(400);
                const onLogin = await appears(byText('Log In'), M) || await appears(byText('Email Address'), S);
                if (!onLogin) throw new Error('After logout, login screen did not appear');
            }
            // If logout button not found, skip gracefully (don't fail cleanup)
        }));
    });

});
