const XLSX = require('xlsx');

// ─── Palette / Styles ─────────────────────────────────────────────────────────
const COLORS = {
  headerBg:   '1A1A2E',  // dark navy
  headerFg:   'FFFFFF',
  pass:       'C6EFCE',  passFont: '276221',
  fail:       'FFC7CE',  failFont: '9C0006',
  blocked:    'FFEB9C',  blockedFont: '9C5700',
  notTested:  'E2EFDA',  ntFont:   '375623',
  modHeader:  '2E4057',  modHeaderFg: 'FFFFFF',
  altRow:     'F2F2F2',
  border:     '000000',
};

const boldFont    = (color = '000000', sz = 10) => ({ bold: true, sz, color: { rgb: color } });
const normalFont  = (color = '000000', sz = 10) => ({ sz, color: { rgb: color } });
const fill        = (rgb) => ({ patternType: 'solid', fgColor: { rgb } });
const border      = () => ({
  top:    { style: 'thin', color: { rgb: COLORS.border } },
  bottom: { style: 'thin', color: { rgb: COLORS.border } },
  left:   { style: 'thin', color: { rgb: COLORS.border } },
  right:  { style: 'thin', color: { rgb: COLORS.border } },
});
const align = (h = 'left', v = 'center', wrap = true) => ({ horizontal: h, vertical: v, wrapText: wrap });

function cellStyle(bgRgb, fontColor, bold = false, sz = 10, halign = 'left') {
  return {
    font:      bold ? boldFont(fontColor, sz) : normalFont(fontColor, sz),
    fill:      fill(bgRgb),
    border:    border(),
    alignment: align(halign, 'center', true),
  };
}

// ─── Column definitions ───────────────────────────────────────────────────────
const COLUMNS = [
  { header: 'Test Case ID',        key: 'id',           width: 14 },
  { header: 'Module',              key: 'module',        width: 28 },
  { header: 'Feature Under Test',  key: 'feature',       width: 30 },
  { header: 'Test Type',           key: 'type',          width: 18 },
  { header: 'Test Scenario',       key: 'scenario',      width: 48 },
  { header: 'Preconditions',       key: 'precond',       width: 32 },
  { header: 'Test Steps',          key: 'steps',         width: 55 },
  { header: 'Expected Result',     key: 'expected',      width: 42 },
  { header: 'Actual Result',       key: 'actual',        width: 42 },
  { header: 'Status',              key: 'status',        width: 12 },
  { header: 'Severity',            key: 'severity',      width: 12 },
  { header: 'Notes / Defect Ref',  key: 'notes',         width: 38 },
];

// ─── Test Data ────────────────────────────────────────────────────────────────
const testCases = [
  // ── Module 1: Auth ──────────────────────────────────────────────────────────
  { id:'TC-AUTH-01', module:'Module 1 — Auth', feature:'Registration',          type:'Functional – Happy Path',  scenario:'User registers with valid email, password, and mock CAPTCHA',                    precond:'App is deployed; user does not exist',                           steps:'1. Navigate to /register\n2. Fill valid email + password\n3. Submit CAPTCHA\n4. Click Register',                                      expected:'Account created; verification email triggered; redirect to check-email page',                                  actual:'Account created; verification email triggered',                                                      status:'Pass',       severity:'Critical', notes:'TC-AUTH-01 verified via API POST /api/v1/auth/register' },
  { id:'TC-AUTH-02', module:'Module 1 — Auth', feature:'Email Verification',    type:'Functional – Happy Path',  scenario:'User verifies email using token from inbox',                                     precond:'Account created (TC-AUTH-01); verification token available',      steps:'1. Open verification link\n2. GET /api/v1/auth/verify-email?token=<token>',                               expected:'is_verified = true; user can now log in',                                                             actual:'is_verified = true confirmed in profile',                                                            status:'Pass',       severity:'Critical', notes:'' },
  { id:'TC-AUTH-03', module:'Module 1 — Auth', feature:'Login / JWT',           type:'Functional – Happy Path',  scenario:'Verified user logs in with correct credentials',                                 precond:'Account verified',                                                steps:'1. POST /api/v1/auth/login with valid email + password\n2. Inspect response',                             expected:'HTTP 200; access_token and refresh_token returned',                                                   actual:'HTTP 200; JWT + refresh token received',                                                             status:'Pass',       severity:'Critical', notes:'' },
  { id:'TC-AUTH-04', module:'Module 1 — Auth', feature:'Token Refresh',         type:'Functional – Happy Path',  scenario:'Client refreshes expired access token',                                          precond:'Valid refresh token available',                                   steps:'1. POST /api/v1/auth/refresh with refresh_token',                                                       expected:'HTTP 200; new access_token issued',                                                                   actual:'New token issued successfully',                                                                      status:'Pass',       severity:'High',     notes:'' },
  { id:'TC-AUTH-05', module:'Module 1 — Auth', feature:'Navigation Links',      type:'Functional – UI',          scenario:'"Create account" link on login page navigates to /register',                    precond:'User is on /login',                                               steps:'1. Navigate to /login\n2. Click "Create account" link',                                                  expected:'Browser navigates to /register',                                                                      actual:'Navigates to /register',                                                                             status:'Pass',       severity:'Medium',   notes:'' },
  { id:'TC-AUTH-06', module:'Module 1 — Auth', feature:'Password Reset',        type:'Functional – Happy Path',  scenario:'User requests password reset and sets a new password',                           precond:'Account exists',                                                  steps:'1. POST /api/v1/auth/forgot-password\n2. Use token from mock email\n3. POST /api/v1/auth/reset-password',   expected:'Password updated; old password rejected on next login',                                               actual:'Reset flow completed; credentials updated',                                                          status:'Pass',       severity:'High',     notes:'' },
  { id:'TC-AUTH-07', module:'Module 1 — Auth', feature:'Login – Negative',      type:'Functional – Negative',    scenario:'Login with wrong password',                                                     precond:'Account exists',                                                  steps:'1. POST /api/v1/auth/login with invalid password',                                                      expected:'HTTP 401 Unauthorized',                                                                               actual:'HTTP 401 returned',                                                                                  status:'Pass',       severity:'High',     notes:'' },
  { id:'TC-AUTH-08', module:'Module 1 — Auth', feature:'Login – Negative',      type:'Functional – Negative',    scenario:'Login with empty password field',                                                precond:'Login page loaded',                                               steps:'1. POST /api/v1/auth/login with empty password',                                                        expected:'HTTP 400 Bad Request (malformed input)',                                                               actual:'HTTP 401 returned — minor deviation from REST best practice',                                        status:'Fail',       severity:'Low',      notes:'Bug: should return 400 for empty payload; currently returns 401. Noted in audit.' },
  { id:'TC-AUTH-09', module:'Module 1 — Auth', feature:'Check-Email UI State',  type:'Functional – UI',          scenario:'Registration success shows "Check your email" confirmation state',                precond:'Fresh registration submitted',                                    steps:'1. Complete registration flow\n2. Observe post-submit UI',                                               expected:'Page transitions to "Check your email" confirmation screen',                                          actual:'Confirmation screen not rendered correctly',                                                         status:'Fail',       severity:'Medium',   notes:'Frontend: check-email state not displayed. Tracked in Playwright test-results.' },
  { id:'TC-AUTH-10', module:'Module 1 — Auth', feature:'Login Page – Single CTA',type:'Functional – UI',         scenario:'Login page exposes exactly one login CTA button',                                precond:'User navigates to /login',                                         steps:'1. Navigate to /login\n2. Assert number of login buttons on page',                                      expected:'Exactly one "Log In" button visible',                                                                 actual:'Test failed — multiple or zero buttons found',                                                       status:'Fail',       severity:'Low',      notes:'Playwright TC: exposes-only-one-login-link — failed in latest run' },
  { id:'TC-AUTH-11', module:'Module 1 — Auth', feature:'Logout',                type:'Functional – Happy Path',  scenario:'Authenticated user logs out',                                                    precond:'User is logged in',                                               steps:'1. Call POST /api/v1/auth/logout with valid token',                                                      expected:'Session invalidated; HTTP 200',                                                                       actual:'HTTP 404 — endpoint not implemented',                                                                status:'Fail',       severity:'Critical', notes:'Critical missing endpoint. Reported in Phase 2 audit.' },
  { id:'TC-AUTH-12', module:'Module 1 — Auth', feature:'Password Change',       type:'Functional – Happy Path',  scenario:'Authenticated user changes their active password',                               precond:'User is logged in',                                               steps:'1. PUT /api/v1/users/me/password with current + new password',                                          expected:'HTTP 200; password updated',                                                                          actual:'HTTP 404 — endpoint missing',                                                                        status:'Fail',       severity:'Critical', notes:'Critical missing endpoint. Reported in Phase 2 audit.' },

  // ── Module 2: User Profile ──────────────────────────────────────────────────
  { id:'TC-PROF-01', module:'Module 2 — User Profile', feature:'Route Protection',      type:'Functional – Security',   scenario:'/profile redirects unauthenticated guests',                                    precond:'User is not logged in',                                           steps:'1. Navigate to /profile without a session',                                                             expected:'Redirect to /login or 401 response',                                                                  actual:'Redirected correctly',                                                                               status:'Pass',       severity:'High',     notes:'TC-PROF-01 passing' },
  { id:'TC-PROF-02', module:'Module 2 — User Profile', feature:'Profile Page Load',     type:'Functional – Happy Path', scenario:'Authenticated user loads profile page and sees profile card',                  precond:'User is logged in',                                               steps:'1. Navigate to /profile',                                                                               expected:'Profile card rendered with user data',                                                                actual:'Profile card displayed correctly',                                                                   status:'Pass',       severity:'High',     notes:'' },
  { id:'TC-PROF-03', module:'Module 2 — User Profile', feature:'Profile Identity',      type:'Functional – Happy Path', scenario:'Profile card shows display name, username, and social counters',               precond:'User has profile data',                                           steps:'1. Navigate to /profile\n2. Verify display name, @username, followers/following counts',                 expected:'All identity fields and counters visible',                                                            actual:'All fields rendered',                                                                                status:'Pass',       severity:'Medium',   notes:'' },
  { id:'TC-PROF-04', module:'Module 2 — User Profile', feature:'Edit Profile Modal',    type:'Functional – Happy Path', scenario:'Edit profile modal opens with pre-filled editable fields',                    precond:'User is logged in',                                               steps:'1. Click Edit Profile\n2. Assert modal opens with input fields',                                        expected:'Modal visible; name, bio, location fields pre-filled',                                                actual:'Modal opens with editable fields',                                                                   status:'Pass',       severity:'Medium',   notes:'' },
  { id:'TC-PROF-05', module:'Module 2 — User Profile', feature:'Avatar Upload',         type:'Functional – Happy Path', scenario:'Avatar upload input accepts image types',                                     precond:'Edit modal open',                                                 steps:'1. Open edit modal\n2. Locate avatar file input\n3. Check accept attribute',                             expected:'Input accepts image/png, image/jpeg',                                                                 actual:'Avatar upload input accepts images',                                                                 status:'Pass',       severity:'Medium',   notes:'TC-PROF-12 (Phase 2 naming)' },
  { id:'TC-PROF-06', module:'Module 2 — User Profile', feature:'Cover Upload',          type:'Functional – Happy Path', scenario:'Cover photo upload input accepts image types',                                precond:'Edit modal open',                                                 steps:'1. Open edit modal\n2. Locate cover file input\n3. Check accept attribute',                              expected:'Input accepts image/png, image/jpeg',                                                                 actual:'Cover upload input accepts images',                                                                  status:'Pass',       severity:'Medium',   notes:'TC-PROF-13 (Phase 2 naming)' },
  { id:'TC-PROF-07', module:'Module 2 — User Profile', feature:'API — Get Profile',     type:'Functional – API',        scenario:'GET /api/users/me returns current user profile',                              precond:'Valid JWT in header',                                             steps:'1. GET /api/users/me with Authorization: Bearer <token>',                                               expected:'HTTP 200; user object with profile fields',                                                           actual:'HTTP 200; profile data returned',                                                                    status:'Pass',       severity:'High',     notes:'' },
  { id:'TC-PROF-08', module:'Module 2 — User Profile', feature:'API — Update Profile',  type:'Functional – API',        scenario:'PATCH /api/users/me updates bio field',                                       precond:'Valid JWT',                                                       steps:'1. PATCH /api/users/me with { bio: "new bio" }',                                                        expected:'HTTP 200; bio updated in DB',                                                                         actual:'HTTP 200; bio updated',                                                                              status:'Pass',       severity:'Medium',   notes:'' },
  { id:'TC-PROF-09', module:'Module 2 — User Profile', feature:'API — Delete Account',  type:'Functional – Negative',   scenario:'DELETE /api/users/me with wrong password returns 403',                        precond:'Logged in user',                                                  steps:'1. DELETE /api/users/me with wrong password',                                                           expected:'HTTP 403 Forbidden',                                                                                  actual:'HTTP 403 returned',                                                                                  status:'Pass',       severity:'High',     notes:'' },
  { id:'TC-PROF-10', module:'Module 2 — User Profile', feature:'API — Delete Account',  type:'Functional – Happy Path', scenario:'DELETE /api/users/me with correct credentials deletes account',               precond:'Logged in user',                                                  steps:'1. DELETE /api/users/me with valid password',                                                           expected:'HTTP 200; account removed',                                                                           actual:'HTTP 200; account deleted',                                                                          status:'Pass',       severity:'High',     notes:'' },
  { id:'TC-PROF-11', module:'Module 2 — User Profile', feature:'API — Bad Request',     type:'Functional – Negative',   scenario:'PATCH /api/users/me with invalid JSON body returns 400',                     precond:'Logged in user',                                                  steps:'1. PATCH /api/users/me with malformed JSON',                                                            expected:'HTTP 400 Bad Request',                                                                                actual:'HTTP 400 returned',                                                                                  status:'Pass',       severity:'Medium',   notes:'' },
  { id:'TC-PROF-12', module:'Module 2 — User Profile', feature:'Social Links Input',    type:'Functional – UI',         scenario:'Edit profile form exposes at least one external link input',                  precond:'Edit modal open',                                                 steps:'1. Open edit modal\n2. Check for social link / website input fields',                                   expected:'At least one URL/link input visible',                                                                 actual:'Test failed — link input not found',                                                                 status:'Fail',       severity:'Low',      notes:'Playwright: ses-at-least-one-link-input — failed. UI may not render link field.' },
  { id:'TC-PROF-13', module:'Module 2 — User Profile', feature:'Error State',           type:'Functional – Edge Case',  scenario:'Profile update failure shows a handled error state',                          precond:'Simulate network/server error on save',                           steps:'1. Trigger save with simulated API failure\n2. Observe UI response',                                    expected:'User-friendly error message displayed; no crash',                                                     actual:'Error state not handled gracefully',                                                                 status:'Fail',       severity:'Medium',   notes:'Playwright: ed-with-handled-error-state — failed' },

  // ── Module 3: Social Graph ───────────────────────────────────────────────────
  { id:'TC-SOC-01',  module:'Module 3 — Social Graph', feature:'Follow User',           type:'Functional – Happy Path', scenario:'User follows another user',                                                   precond:'Both users exist; not already following',                         steps:'1. POST /api/v1/users/:id/follow',                                                                      expected:'HTTP 200; follow relationship created',                                                               actual:'HTTP 404 — route disabled',                                                                          status:'Fail',       severity:'Critical', notes:'social.routes.js fully commented out in current deployment' },
  { id:'TC-SOC-02',  module:'Module 3 — Social Graph', feature:'Unfollow User',         type:'Functional – Happy Path', scenario:'User unfollows a followed user',                                               precond:'Follow relationship exists',                                      steps:'1. DELETE /api/v1/users/:id/follow',                                                                    expected:'HTTP 200; relationship removed',                                                                      actual:'HTTP 404 — route disabled',                                                                          status:'Fail',       severity:'Critical', notes:'Routes disabled' },
  { id:'TC-SOC-03',  module:'Module 3 — Social Graph', feature:'Followers List',        type:'Functional – Happy Path', scenario:'Get list of followers for a user',                                            precond:'User has followers',                                              steps:'1. GET /api/v1/users/:id/followers',                                                                    expected:'HTTP 200; array of follower objects',                                                                 actual:'HTTP 404 — route disabled',                                                                          status:'Fail',       severity:'High',     notes:'Routes disabled' },
  { id:'TC-SOC-04',  module:'Module 3 — Social Graph', feature:'Following List',        type:'Functional – Happy Path', scenario:'Get list of users a user is following',                                       precond:'User is following others',                                        steps:'1. GET /api/v1/users/:id/following',                                                                    expected:'HTTP 200; array of following objects',                                                                actual:'HTTP 404 — route disabled',                                                                          status:'Fail',       severity:'High',     notes:'Routes disabled' },
  { id:'TC-SOC-05',  module:'Module 3 — Social Graph', feature:'Suggested Users',       type:'Functional – Happy Path', scenario:'Get suggested users to follow',                                               precond:'User is authenticated',                                           steps:'1. GET /api/v1/users/suggestions',                                                                      expected:'HTTP 200; list of suggested users',                                                                   actual:'HTTP 404 — route disabled',                                                                          status:'Fail',       severity:'Medium',   notes:'Routes disabled' },
  { id:'TC-SOC-06',  module:'Module 3 — Social Graph', feature:'Blocking',              type:'Functional – Happy Path', scenario:'User blocks another user',                                                    precond:'Target user exists',                                              steps:'1. Navigate to user profile\n2. Click Block',                                                           expected:'User blocked; blocked users list updated',                                                            actual:'Route/UI not functional',                                                                            status:'Fail',       severity:'High',     notes:'Routes disabled; blocked-list UI test also failed' },
  { id:'TC-SOC-07',  module:'Module 3 — Social Graph', feature:'Social UI — Tabs',      type:'Functional – UI',         scenario:'Social routes render tabs and route-specific headings',                       precond:'User navigated to followers/following page',                      steps:'1. Navigate to /<user>/followers\n2. Check tabs rendered',                                               expected:'Tabs for Followers / Following visible with headings',                                                 actual:'Smoke test M3-SMOKE-01 passed',                                                                      status:'Pass',       severity:'Low',      notes:'UI shell renders even though API is disabled' },
  { id:'TC-SOC-08',  module:'Module 3 — Social Graph', feature:'Social UI — Empty State', type:'Functional – UI',       scenario:'Following page shows user content or a handled empty state',                  precond:'User on following page',                                          steps:'1. Navigate to following page without followers',                                                       expected:'Empty state message or user list shown',                                                              actual:'M3-SMOKE-02 passed — handled state shown',                                                           status:'Pass',       severity:'Low',      notes:'' },
  { id:'TC-SOC-09',  module:'Module 3 — Social Graph', feature:'Edit Bio in Social ctx', type:'Functional – UI',        scenario:'Bio text updates and cancel button works on social profile edit',             precond:'User on own social profile page',                                 steps:'1. Click edit bio\n2. Update text\n3. Click cancel',                                                    expected:'Text reverts on cancel; no save occurs',                                                              actual:'Test failed',                                                                                        status:'Fail',       severity:'Medium',   notes:'Playwright: rts-text-updates-and-cancel — failed' },
  { id:'TC-SOC-10',  module:'Module 3 — Social Graph', feature:'Blocked Users List',     type:'Functional – UI',        scenario:'Blocked users list shows valid state',                                        precond:'Some users blocked',                                              steps:'1. Navigate to settings > blocked users',                                                               expected:'List of blocked users or empty state',                                                                actual:'Test failed — invalid state rendered',                                                               status:'Fail',       severity:'Medium',   notes:'Playwright: a-valid-blocked-list-state — failed' },

  // ── Module 4: Tracks ─────────────────────────────────────────────────────────
  { id:'TC-TRK-01',  module:'Module 4 — Audio Tracks', feature:'Track Page Render',     type:'Functional – UI',         scenario:'Track detail page renders with time format text',                             precond:'Track exists and is public',                                      steps:'1. Navigate to /tracks/:id',                                                                            expected:'Track page loads; duration displayed in mm:ss format',                                                actual:'Test failed — time format text not found',                                                           status:'Fail',       severity:'Medium',   notes:'Playwright: nders-with-time-format-text — failed' },
  { id:'TC-TRK-02',  module:'Module 4 — Audio Tracks', feature:'Track Upload',          type:'Functional – Happy Path', scenario:'Artist uploads an MP3 track with metadata',                                   precond:'User has Artist role; upload limit not reached',                  steps:'1. Go to upload page\n2. Select MP3 file\n3. Fill title, genre, tags\n4. Submit',                       expected:'Track created with Processing state; transitions to Finished',                                        actual:'Not tested in e2e run',                                                                              status:'Not Tested', severity:'High',     notes:'Benchmark module — requires live upload flow' },
  { id:'TC-TRK-03',  module:'Module 4 — Audio Tracks', feature:'Track Privacy Toggle',  type:'Functional – Happy Path', scenario:'Artist toggles track from Public to Private',                                 precond:'Track exists and is owned by user',                               steps:'1. Go to track settings\n2. Toggle visibility to Private\n3. Save',                                     expected:'Track removed from public search; accessible by direct link only',                                    actual:'Not tested in e2e run',                                                                              status:'Not Tested', severity:'Medium',   notes:'' },
  { id:'TC-TRK-04',  module:'Module 4 — Audio Tracks', feature:'Waveform Display',      type:'Functional – UI',         scenario:'Track page renders waveform visualization',                                   precond:'Track page loaded',                                               steps:'1. Navigate to a track page\n2. Inspect waveform element',                                              expected:'Waveform SVG/canvas element visible',                                                                 actual:'Not tested in e2e run',                                                                              status:'Not Tested', severity:'Low',      notes:'' },

  // ── Module 5: Playback ───────────────────────────────────────────────────────
  { id:'TC-PLAY-01', module:'Module 5 — Playback', feature:'Play Button',              type:'Functional – Happy Path', scenario:'Play button is visible on track hero and triggers playback',              precond:'Public track page loaded',                                        steps:'1. Navigate to /tracks/:id\n2. Assert play button exists\n3. Click play',                               expected:'Play button visible; audio begins on click',                                                          actual:'Test failed — play button not found on hero',                                                        status:'Fail',       severity:'Critical', notes:'Playwright: on-is-visible-on-track-hero — failed' },
  { id:'TC-PLAY-02', module:'Module 5 — Playback', feature:'Playing State UI',         type:'Functional – UI',         scenario:'Clicking play transitions hero to is-playing state',                         precond:'Track page loaded',                                               steps:'1. Click play\n2. Check playing CSS class or aria state',                                               expected:'Hero shows playing indicator (e.g. pause icon, progress bar active)',                                 actual:'Test failed — playing state not reflected',                                                          status:'Fail',       severity:'High',     notes:'Playwright: es-hero-to-is-playing-state — failed' },
  { id:'TC-PLAY-03', module:'Module 5 — Playback', feature:'Progress Bar',             type:'Functional – UI',         scenario:'Progress bar is present on the page during playback',                        precond:'Track playing',                                                   steps:'1. Start playback\n2. Assert progress bar element exists',                                              expected:'Progress bar element visible and updating',                                                           actual:'Test failed',                                                                                        status:'Fail',       severity:'High',     notes:'Playwright: bar-is-present-on-the-page — failed' },
  { id:'TC-PLAY-04', module:'Module 5 — Playback', feature:'Seek',                     type:'Functional – Happy Path', scenario:'Progress bar is interactive for seeking',                                    precond:'Track playing',                                                   steps:'1. Click on progress bar at 50%\n2. Observe playback position',                                         expected:'Playback jumps to clicked position',                                                                  actual:'Test failed',                                                                                        status:'Fail',       severity:'High',     notes:'Playwright: and-interactive-for-seeking — failed' },
  { id:'TC-PLAY-05', module:'Module 5 — Playback', feature:'Playback States',          type:'Functional – Edge Case',  scenario:'Player handles Playable, Preview, and Blocked access tiers without crashing', precond:'Different user tier accounts',                                    steps:'1. Test playback as Free user\n2. Test playback as Pro user\n3. Test blocked region',                   expected:'Correct state per tier; no JS crash',                                                                 actual:'Test failed — tier handling crashed or showed wrong state',                                          status:'Fail',       severity:'High',     notes:'Playwright: s-Playable-Preview-Blocked — failed' },
  { id:'TC-PLAY-06', module:'Module 5 — Playback', feature:'Listening History',        type:'Functional – Happy Path', scenario:'Profile shows playback history section',                                     precond:'User has listened to tracks',                                     steps:'1. Navigate to /profile/history or history tab',                                                        expected:'List of recently played tracks shown',                                                                actual:'Test failed — history section not found',                                                            status:'Fail',       severity:'Medium',   notes:'Playwright: rs-playback-history-section — failed' },
  { id:'TC-PLAY-07', module:'Module 5 — Playback', feature:'Recently Played',          type:'Functional – Happy Path', scenario:'Recently played shows cards or empty state',                                 precond:'User authenticated',                                              steps:'1. Navigate to recently played section',                                                                expected:'Track cards or "Nothing played yet" message',                                                         actual:'Test failed',                                                                                        status:'Fail',       severity:'Medium',   notes:'Playwright: shows-cards-or-empty-state — failed' },
  { id:'TC-PLAY-08', module:'Module 5 — Playback', feature:'History on Navigate Away', type:'Functional – Happy Path', scenario:'Navigating away from track page preserves history entry',                   precond:'Track played partially',                                          steps:'1. Play track\n2. Navigate to another page\n3. Check history',                                          expected:'Track appears in history',                                                                            actual:'Test failed',                                                                                        status:'Fail',       severity:'Medium',   notes:'Playwright: gating-away-from-track-page — failed' },
  { id:'TC-PLAY-09', module:'Module 5 — Playback', feature:'History Page Visible',     type:'Functional – UI',         scenario:'History page is accessible and visible',                                     precond:'User authenticated',                                              steps:'1. Navigate to history page URL',                                                                       expected:'History page renders',                                                                                actual:'Test failed',                                                                                        status:'Fail',       severity:'Medium',   notes:'Playwright: is-visible-on-history-page — failed' },

  // ── Module 6: Engagement ─────────────────────────────────────────────────────
  { id:'TC-ENG-01',  module:'Module 6 — Engagement', feature:'Like Button',             type:'Functional – Happy Path', scenario:'Like button is visible and clickable on track actions row',               precond:'Track page loaded; user authenticated',                           steps:'1. Navigate to track page\n2. Assert like button\n3. Click like',                                       expected:'Like button present and clickable; like count increments',                                            actual:'Test failed — like button not found',                                                                status:'Fail',       severity:'High',     notes:'Playwright: isible-in-track-actions-row + on-is-present-and-clickable — failed (x2)' },
  { id:'TC-ENG-02',  module:'Module 6 — Engagement', feature:'Repost Button',           type:'Functional – Happy Path', scenario:'Repost button is visible and clickable on track actions row',             precond:'Track page loaded; user authenticated',                           steps:'1. Navigate to track page\n2. Assert repost button\n3. Click repost',                                   expected:'Repost button present; repost count increments',                                                      actual:'Test failed',                                                                                        status:'Fail',       severity:'High',     notes:'Playwright: isible-in-track-actions-row + on-is-present-and-clickable — failed (x2)' },
  { id:'TC-ENG-03',  module:'Module 6 — Engagement', feature:'Comment Bar',             type:'Functional – UI',         scenario:'Comment bar is visible on track page',                                    precond:'Track page loaded',                                               steps:'1. Navigate to track page\n2. Scroll to comments section',                                              expected:'Comment input bar/section visible',                                                                   actual:'Test failed',                                                                                        status:'Fail',       severity:'High',     notes:'Playwright: ar-is-visible-on-track-page — failed' },
  { id:'TC-ENG-04',  module:'Module 6 — Engagement', feature:'Comment Composer',        type:'Functional – UI',         scenario:'Comment composer input is visible',                                       precond:'Track page loaded; user authenticated',                           steps:'1. Navigate to track page\n2. Assert comment input field',                                              expected:'Text input for composing comment visible',                                                            actual:'Test failed',                                                                                        status:'Fail',       severity:'Medium',   notes:'Playwright: visible-in-comment-composer — failed' },
  { id:'TC-ENG-05',  module:'Module 6 — Engagement', feature:'Comment Thread',          type:'Functional – Happy Path', scenario:'Comment section renders thread or empty state',                           precond:'Track page loaded',                                               steps:'1. Navigate to track page comments\n2. Check for thread or empty message',                              expected:'Comment thread or "No comments yet" message shown',                                                   actual:'Test failed',                                                                                        status:'Fail',       severity:'Medium',   notes:'Playwright: with-thread-or-empty-state — failed' },
  { id:'TC-ENG-06',  module:'Module 6 — Engagement', feature:'Likers List Panel',       type:'Functional – UI',         scenario:'Likers section list panel renders',                                       precond:'Track has likes',                                                 steps:'1. Click "N likes" on a track\n2. Check modal/panel',                                                   expected:'List of users who liked the track shown',                                                             actual:'Test failed',                                                                                        status:'Fail',       severity:'Low',      notes:'Playwright: renders-section-list-panel — failed (x2)' },

  // ── Module 7: Playlists ──────────────────────────────────────────────────────
  { id:'TC-PL-01',   module:'Module 7 — Playlists', feature:'Playlist Page with Tracks', type:'Functional – UI',        scenario:'Playlist detail page renders with track list',                           precond:'Playlist exists with tracks',                                     steps:'1. Navigate to /sets/:id\n2. Check track list renders',                                                 expected:'Track list displayed inside playlist',                                                                actual:'Test failed',                                                                                        status:'Fail',       severity:'High',     notes:'Playwright: cks-renders-with-track-list — failed' },
  { id:'TC-PL-02',   module:'Module 7 — Playlists', feature:'Create Playlist Option',   type:'Functional – UI',         scenario:'Library view shows playlists or a Create Playlist option',               precond:'User authenticated',                                              steps:'1. Navigate to /library or /sets\n2. Check for playlist list or create button',                         expected:'Playlist list or "Create playlist" CTA visible',                                                      actual:'Test failed',                                                                                        status:'Fail',       severity:'Medium',   notes:'Playwright: s-or-Create-playlist-option — failed (x2)' },
  { id:'TC-PL-03',   module:'Module 7 — Playlists', feature:'Create Playlist Form',     type:'Functional – UI',         scenario:'Create playlist form shows title input and privacy options',              precond:'Create playlist modal open',                                      steps:'1. Click Create Playlist\n2. Check form fields',                                                        expected:'Title input + Public/Private toggle visible',                                                         actual:'Test failed',                                                                                        status:'Fail',       severity:'Medium',   notes:'Playwright: e-input-and-privacy-options — failed' },
  { id:'TC-PL-04',   module:'Module 7 — Playlists', feature:'Create Playlist Success',  type:'Functional – Happy Path', scenario:'Creating a playlist shows success confirmation',                         precond:'Form filled with valid title',                                    steps:'1. Fill title\n2. Set visibility\n3. Submit',                                                           expected:'Success toast/modal confirms playlist created',                                                        actual:'Test failed',                                                                                        status:'Fail',       severity:'High',     notes:'Playwright: shows-success-confirmation — failed' },

  // ── Module 8: Search & Discovery ─────────────────────────────────────────────
  { id:'TC-SRCH-01', module:'Module 8 — Search & Discovery', feature:'Global Search',   type:'Functional – Happy Path', scenario:'Search bar returns relevant tracks and users for a keyword',          precond:'Tracks and users exist in DB',                                    steps:'1. Enter keyword in search bar\n2. Submit\n3. Inspect results',                                         expected:'Matching tracks, users, playlists shown',                                                             actual:'Not tested in e2e run',                                                                              status:'Not Tested', severity:'High',     notes:'' },
  { id:'TC-SRCH-02', module:'Module 8 — Search & Discovery', feature:'Feed',            type:'Functional – Happy Path', scenario:'Authenticated user sees activity feed from followed artists',         precond:'User follows at least one artist with uploads',                   steps:'1. Navigate to home/stream feed\n2. Check feed content',                                                expected:'Chronological list of tracks from followed users',                                                    actual:'Not tested in e2e run',                                                                              status:'Not Tested', severity:'High',     notes:'' },
  { id:'TC-SRCH-03', module:'Module 8 — Search & Discovery', feature:'Trending',        type:'Functional – Happy Path', scenario:'Trending/charts section shows top tracks',                            precond:'Play counts exist',                                               steps:'1. Navigate to /trending\n2. Verify list',                                                              expected:'Top tracks ordered by play count / engagement',                                                       actual:'Not tested',                                                                                         status:'Not Tested', severity:'Medium',   notes:'' },

  // ── Module 9: Messaging ───────────────────────────────────────────────────────
  { id:'TC-MSG-01',  module:'Module 9 — Messaging', feature:'Send Direct Message',      type:'Functional – Happy Path', scenario:'User sends a text message to another user',                           precond:'Both users exist; not blocked',                                   steps:'1. Navigate to /messages/:userId\n2. Type message\n3. Send',                                            expected:'Message delivered and displayed in thread',                                                           actual:'Not tested',                                                                                         status:'Not Tested', severity:'High',     notes:'' },
  { id:'TC-MSG-02',  module:'Module 9 — Messaging', feature:'Unread Count',             type:'Functional – Happy Path', scenario:'Unread message count updates on new message',                        precond:'User has unread messages',                                        steps:'1. Receive message\n2. Check notification badge',                                                       expected:'Badge shows correct unread count',                                                                    actual:'Not tested',                                                                                         status:'Not Tested', severity:'Medium',   notes:'' },

  // ── Module 10: Notifications ──────────────────────────────────────────────────
  { id:'TC-NOTIF-01',module:'Module 10 — Notifications', feature:'Like Notification',   type:'Functional – Happy Path', scenario:'User receives notification when their track is liked',             precond:'Track exists; another user likes it',                             steps:'1. User A likes User B track\n2. User B checks notifications',                                          expected:'Notification: "User A liked your track" appears',                                                     actual:'Not tested',                                                                                         status:'Not Tested', severity:'Medium',   notes:'' },
  { id:'TC-NOTIF-02',module:'Module 10 — Notifications', feature:'Mark All Read',       type:'Functional – Happy Path', scenario:'Mark all notifications as read clears unread counter',            precond:'Unread notifications exist',                                      steps:'1. Click "Mark all as read"\n2. Check counter',                                                         expected:'Counter reset to 0; all notifications marked read',                                                   actual:'Not tested',                                                                                         status:'Not Tested', severity:'Low',      notes:'' },

  // ── Module 11: Admin ──────────────────────────────────────────────────────────
  { id:'TC-ADM-01',  module:'Module 11 — Admin', feature:'Report System',               type:'Functional – Happy Path', scenario:'User reports a track for copyright violation',                    precond:'Track exists; user authenticated',                                steps:'1. Click Report on track\n2. Select Copyright\n3. Submit',                                               expected:'Report submitted; confirmation shown',                                                                actual:'Not tested',                                                                                         status:'Not Tested', severity:'Medium',   notes:'' },
  { id:'TC-ADM-02',  module:'Module 11 — Admin', feature:'Admin — Suspend Account',     type:'Functional – Admin',      scenario:'Admin suspends a user account',                                   precond:'Admin dashboard accessible',                                      steps:'1. Log in as admin\n2. Find user\n3. Click Suspend',                                                    expected:'Account suspended; user cannot log in',                                                               actual:'Not tested',                                                                                         status:'Not Tested', severity:'High',     notes:'' },

  // ── Module 12: Premium ────────────────────────────────────────────────────────
  { id:'TC-PREM-01', module:'Module 12 — Premium', feature:'Upload Limit – Free',       type:'Functional – Happy Path', scenario:'Free user is blocked after uploading 3 tracks',                  precond:'Free user has 3 existing uploads',                                steps:'1. Attempt 4th upload as free user',                                                                     expected:'Paywall shown; upload blocked with upgrade prompt',                                                   actual:'Not tested',                                                                                         status:'Not Tested', severity:'High',     notes:'' },
  { id:'TC-PREM-02', module:'Module 12 — Premium', feature:'Stripe Subscription Mock',  type:'Functional – Happy Path', scenario:'User completes mock Stripe payment and gains Pro tier',           precond:'User on subscription page',                                       steps:'1. Click Upgrade\n2. Enter mock card details\n3. Confirm',                                               expected:'Subscription active; unlimited uploads unlocked',                                                     actual:'Not tested',                                                                                         status:'Not Tested', severity:'High',     notes:'Stripe is mocked' },
  { id:'TC-PREM-03', module:'Module 12 — Premium', feature:'Ad-Free Experience',        type:'Functional – Happy Path', scenario:'Pro user does not see ads during playback',                       precond:'Pro subscription active',                                         steps:'1. Log in as Pro user\n2. Play tracks',                                                                 expected:'No ad banners or interruptions',                                                                      actual:'Not tested',                                                                                         status:'Not Tested', severity:'Medium',   notes:'' },
];

// ─── Build Workbook ────────────────────────────────────────────────────────────
const wb = XLSX.utils.book_new();

// ── Sheet 1: Testing Matrix ──────────────────────────────────────────────────
const wsData = [];

// Title row
wsData.push([{ v: 'Pulsify — E2E Blackbox Testing Matrix', t: 's' }, ...Array(COLUMNS.length - 1).fill({ v: '', t: 's' })]);
// Subtitle row
wsData.push([{ v: 'Team 7 | Tester: Mahmoud Attia | Phase 3 | CMPS203 SWE S26', t: 's' }, ...Array(COLUMNS.length - 1).fill({ v: '', t: 's' })]);
// Empty row
wsData.push(Array(COLUMNS.length).fill({ v: '', t: 's' }));
// Header row
wsData.push(COLUMNS.map(c => ({ v: c.header, t: 's' })));

// Data rows
testCases.forEach(tc => {
  wsData.push(COLUMNS.map(c => ({ v: tc[c.key] ?? '', t: 's' })));
});

const ws = XLSX.utils.aoa_to_sheet(wsData);

// Column widths
ws['!cols'] = COLUMNS.map(c => ({ wch: c.width }));

// Merge title cells
ws['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: COLUMNS.length - 1 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: COLUMNS.length - 1 } },
];

// Freeze panes: freeze header row (row 4)
ws['!freeze'] = { xSplit: 0, ySplit: 4 };

// Apply cell styles
const range = XLSX.utils.decode_range(ws['!ref']);

for (let R = range.s.r; R <= range.e.r; R++) {
  for (let C = range.s.c; C <= range.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: R, c: C });
    if (!ws[addr]) ws[addr] = { v: '', t: 's' };

    const statusCol = COLUMNS.findIndex(c => c.key === 'status');
    const isHeader  = R === 3;
    const isTitle   = R === 0 || R === 1;
    const dataRow   = R - 4; // 0-indexed data row
    const isAlt     = dataRow >= 0 && dataRow % 2 === 1;

    if (isTitle) {
      ws[addr].s = {
        font:      boldFont('FFFFFF', R === 0 ? 14 : 11),
        fill:      fill(COLORS.headerBg),
        alignment: align('center', 'center', false),
        border:    border(),
      };
    } else if (isHeader) {
      ws[addr].s = {
        font:      boldFont(COLORS.headerFg, 10),
        fill:      fill(COLORS.headerBg),
        alignment: align('center', 'center', false),
        border:    border(),
      };
    } else if (C === statusCol && dataRow >= 0) {
      const status = ws[addr].v;
      let bg = 'FFFFFF'; let fg = '000000';
      if (status === 'Pass')       { bg = COLORS.pass;      fg = COLORS.passFont; }
      if (status === 'Fail')       { bg = COLORS.fail;      fg = COLORS.failFont; }
      if (status === 'Blocked')    { bg = COLORS.blocked;   fg = COLORS.blockedFont; }
      if (status === 'Not Tested') { bg = COLORS.notTested; fg = COLORS.ntFont; }
      ws[addr].s = { font: boldFont(fg, 10), fill: fill(bg), alignment: align('center', 'center', false), border: border() };
    } else {
      ws[addr].s = {
        font:      normalFont('000000', 10),
        fill:      fill(isAlt ? COLORS.altRow : 'FFFFFF'),
        alignment: align('left', 'center', true),
        border:    border(),
      };
    }
  }
}

XLSX.utils.book_append_sheet(wb, ws, 'Testing Matrix');

// ── Sheet 2: Summary Dashboard ───────────────────────────────────────────────
const summaryData = [
  [{ v: 'Pulsify — Test Execution Summary', t: 's' }, { v: '', t: 's' }, { v: '', t: 's' }, { v: '', t: 's' }],
  [{ v: 'Team 7 | Tester: Mahmoud Attia | Phase 3 | CMPS203 SWE S26', t: 's' }, { v: '', t: 's' }, { v: '', t: 's' }, { v: '', t: 's' }],
  [{ v: '', t: 's' }, { v: '', t: 's' }, { v: '', t: 's' }, { v: '', t: 's' }],
  [{ v: 'Module', t: 's' }, { v: 'Total TCs', t: 's' }, { v: '✅ Pass', t: 's' }, { v: '❌ Fail', t: 's' }, { v: '⚠️ Not Tested', t: 's' }, { v: 'Pass Rate', t: 's' }],
];

const modules = [
  'Module 1 — Auth',
  'Module 2 — User Profile',
  'Module 3 — Social Graph',
  'Module 4 — Audio Tracks',
  'Module 5 — Playback',
  'Module 6 — Engagement',
  'Module 7 — Playlists',
  'Module 8 — Search & Discovery',
  'Module 9 — Messaging',
  'Module 10 — Notifications',
  'Module 11 — Admin',
  'Module 12 — Premium',
];

modules.forEach(mod => {
  const tcs   = testCases.filter(t => t.module === mod);
  const pass  = tcs.filter(t => t.status === 'Pass').length;
  const fail  = tcs.filter(t => t.status === 'Fail').length;
  const nt    = tcs.filter(t => t.status === 'Not Tested').length;
  const total = tcs.length;
  const rate  = total > 0 ? `${Math.round((pass / (pass + fail)) * 100 || 0)}%` : 'N/A';
  summaryData.push([
    { v: mod,   t: 's' },
    { v: total, t: 'n' },
    { v: pass,  t: 'n' },
    { v: fail,  t: 'n' },
    { v: nt,    t: 'n' },
    { v: rate,  t: 's' },
  ]);
});

// Totals row
const totalAll  = testCases.length;
const totalPass = testCases.filter(t => t.status === 'Pass').length;
const totalFail = testCases.filter(t => t.status === 'Fail').length;
const totalNT   = testCases.filter(t => t.status === 'Not Tested').length;
summaryData.push([{ v: '', t: 's' }]);
summaryData.push([
  { v: 'TOTAL', t: 's' },
  { v: totalAll, t: 'n' },
  { v: totalPass, t: 'n' },
  { v: totalFail, t: 'n' },
  { v: totalNT, t: 'n' },
  { v: `${Math.round((totalPass / (totalPass + totalFail)) * 100)}%`, t: 's' },
]);

const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
ws2['!cols'] = [{ wch: 34 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 12 }];
ws2['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
];

// Style summary sheet
const r2 = XLSX.utils.decode_range(ws2['!ref']);
for (let R = r2.s.r; R <= r2.e.r; R++) {
  for (let C = r2.s.c; C <= r2.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: R, c: C });
    if (!ws2[addr]) ws2[addr] = { v: '', t: 's' };
    if (R === 0 || R === 1) {
      ws2[addr].s = { font: boldFont('FFFFFF', R === 0 ? 14 : 11), fill: fill(COLORS.headerBg), alignment: align('center', 'center', false), border: border() };
    } else if (R === 3) {
      ws2[addr].s = { font: boldFont('FFFFFF', 10), fill: fill(COLORS.headerBg), alignment: align('center', 'center', false), border: border() };
    } else {
      const v = ws2[addr].v;
      // Colour pass/fail columns
      let bg = (R % 2 === 0) ? COLORS.altRow : 'FFFFFF';
      let fnt = normalFont('000000', 10);
      if (R > 3 && C === 2 && typeof v === 'number') { bg = COLORS.pass; fnt = boldFont(COLORS.passFont, 10); }
      if (R > 3 && C === 3 && typeof v === 'number') { bg = COLORS.fail; fnt = boldFont(COLORS.failFont, 10); }
      if (ws2[addr].v === 'TOTAL') fnt = boldFont('000000', 11);
      ws2[addr].s = { font: fnt, fill: fill(bg), alignment: align(C === 0 ? 'left' : 'center', 'center', false), border: border() };
    }
  }
}

XLSX.utils.book_append_sheet(wb, ws2, 'Summary Dashboard');

// ── Write File ──────────────────────────────────────────────────────────────
const outPath = 'd:\\CCEE\\spring 26\\CMPS203 - Software Engineering\\Project\\pulsify\\Testing\\Pulsify_Testing_Matrix.xlsx';
XLSX.writeFile(wb, outPath, { bookType: 'xlsx', type: 'buffer', cellStyles: true });
console.log('✅ Excel file written to:', outPath);
console.log(`   Total test cases: ${totalAll} | Pass: ${totalPass} | Fail: ${totalFail} | Not Tested: ${totalNT}`);
