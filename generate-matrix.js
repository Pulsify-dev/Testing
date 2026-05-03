const xlsx = require('./node_modules/xlsx');

// Palette
const C = {
  headerBg:    '1A1A2E',
  headerFg:    'FFFFFF',
  subHeaderBg: '16213E',
  subHeaderFg: 'E0E0E0',
  pass:        'C6EFCE', passFont: '276221',
  fail:        'FFC7CE', failFont: '9C0006',
  altRow:      'F2F2F7',
  border:      'BFBFBF',
};

function bs(style = 'thin') {
  const s = { style, color: { rgb: C.border } };
  return { top: s, bottom: s, left: s, right: s };
}

function cs(bg, fg, bold = false, sz = 10, wrap = false, ha = 'left') {
  return {
    fill: { fgColor: { rgb: bg } },
    font: { color: { rgb: fg }, bold, sz, name: 'Calibri' },
    border: bs(),
    alignment: { wrapText: wrap, vertical: 'center', horizontal: ha },
  };
}

// ── Failed test IDs (from test-results directories) ──────────────────────────
// Mapped from folder names:
// module-01-auth-reg   …exposes-only-one-login-link      → TC-AUTH-REGISTER-06
// module-01-auth-ver   …ion-shows-check-email-state      → TC-M1-V04
// module-02-profile    …therwise-show-handled-error (x3) → TC-M2-SAVE-01,02,03
// module-02-profile    …ses-at-least-one-link-input      → TC-M2-EDIT-06
// module-02-profile    …ed-with-handled-error-state      → TC-M2-SAVE-04
// module-03-social-m   …a-valid-blocked-list-state       → TC-M3-MOD-04
// module-03-social-m   …rts-text-updates-and-cancel      → TC-M3-MOD-03
// module-03-social-m   …content-or-a-handled-state       → TC-M3-MOD-02
// module-03-social-n   …ollowers-and-blocked-routes      → TC-M3-NAV-01
// module-08-discover   …results-or-no-results-state      → TC-M8-SRC-02
// module-08-discover   …ader-renders-handled-state       → TC-M8-TRD-03
// module-09-messagin   …dge-or-no-badge-both-valid       → TC-M9-STA-01
// module-12-premium    …paywall-on-the-upload-page       → TC-M12-PAY-02
const FAIL = new Set([
  'TC-AUTH-REGISTER-06',
  'TC-M1-V04',
  'TC-M2-SAVE-01',
  'TC-M2-SAVE-02',
  'TC-M2-SAVE-03',
  'TC-M2-EDIT-06',
  'TC-M2-SAVE-04',
  'TC-M3-MOD-02',
  'TC-M3-MOD-03',
  'TC-M3-MOD-04',
  'TC-M3-NAV-01',
  'TC-M8-SRC-02',
  'TC-M8-TRD-03',
  'TC-M9-STA-01',
  'TC-M12-PAY-02',
]);

// ── Failure notes per test ────────────────────────────────────────────────────
const FAIL_NOTES = {
  'TC-AUTH-REGISTER-06': 'Register page had more than one login link in DOM',
  'TC-M1-V04':           'Registration flow did not reach check-email state (CAPTCHA/network)',
  'TC-M2-SAVE-01':       'Saving unchanged form did not return a recognisable success/error state',
  'TC-M2-SAVE-02':       'Display-name/bio save did not reflect change or show handled error',
  'TC-M2-SAVE-03':       'City/country save did not persist or show handled error',
  'TC-M2-EDIT-06':       'Add-link action did not expose a link input field',
  'TC-M2-SAVE-04':       'Overly long display name was not rejected with a visible error',
  'TC-M3-MOD-02':        'Blocked-users route showed neither list content nor a handled empty state',
  'TC-M3-MOD-03':        'Edit-reason modal did not accept text updates or cancel correctly',
  'TC-M3-MOD-04':        'Unblock action did not result in a valid blocked-list state',
  'TC-M3-NAV-01':        'Social tabs did not correctly navigate to following/followers/blocked routes',
  'TC-M8-SRC-02':        'Keyword search returned neither results nor a no-results state',
  'TC-M8-TRD-03':        'Trending chart list/loader did not render a handled state',
  'TC-M9-STA-01':        'Messages nav badge state caused an unexpected assertion failure',
  'TC-M12-PAY-02':       'Free user at upload limit did not see paywall overlay on /upload',
};

// ── Test definitions (140 tests) ──────────────────────────────────────────────
const tests = [
  // M1 – Auth
  { id:'TC-M1-L01',          mod:'M1 – Authentication', feat:'Login Form',         type:'Functional',  scenario:'Empty email disables submit',                            pre:'On /login page',                   steps:'Open /login → observe submit with empty email',                        exp:'Submit button is disabled',                                    sev:'High'    },
  { id:'TC-M1-L02',          mod:'M1 – Authentication', feat:'Login Form',         type:'Validation',  scenario:'Invalid email format rejected',                          pre:'On /login page',                   steps:'Enter "notanemail" → submit',                                          exp:'Validation error shown',                                       sev:'High'    },
  { id:'TC-M1-L03',          mod:'M1 – Authentication', feat:'Login Form',         type:'Validation',  scenario:'Password field required',                               pre:'On /login page',                   steps:'Enter valid email, leave password empty → submit',                     exp:'Submit disabled / error shown',                                sev:'High'    },
  { id:'TC-M1-L04',          mod:'M1 – Authentication', feat:'Branding',           type:'UI',          scenario:'Pulsify branding visible on login',                      pre:'On /login page',                   steps:'Open /login → check logo/brand',                                       exp:'Pulsify branding present',                                     sev:'Low'     },
  { id:'TC-AUTH-LOGIN-05',   mod:'M1 – Authentication', feat:'Login Navigation',   type:'Navigation',  scenario:'Create account link goes to /register',                  pre:'On /login page',                   steps:'Click "Create account"',                                               exp:'Navigated to /register',                                       sev:'Medium'  },
  { id:'TC-AUTH-LOGIN-06',   mod:'M1 – Authentication', feat:'Login Navigation',   type:'Navigation',  scenario:'Forgot password link goes to recovery',                  pre:'On /login page',                   steps:'Click "Forgot password"',                                              exp:'Navigated to /forgot-password',                                sev:'Medium'  },
  { id:'TC-AUTH-LOGIN-07',   mod:'M1 – Authentication', feat:'Login',              type:'Negative',    scenario:'Invalid credentials show error, user stays on /login',   pre:'On /login page',                   steps:'Enter wrong credentials → submit',                                     exp:'Error shown, user stays on /login',                            sev:'Critical' },
  { id:'TC-AUTH-LOGIN-08',   mod:'M1 – Authentication', feat:'Session',            type:'Security',    scenario:'Successful login stores JWT tokens',                     pre:'Valid credentials available',      steps:'Log in → check localStorage',                                          exp:'access_token & refresh_token stored',                          sev:'Critical' },
  { id:'TC-AUTH-LOGIN-09',   mod:'M1 – Authentication', feat:'Auth Guard',         type:'Security',    scenario:'Logged-in user redirected away from /login',             pre:'User is authenticated',            steps:'Navigate to /login while logged in',                                   exp:'Redirected away from /login',                                  sev:'High'    },
  { id:'TC-AUTH-RECOVERY-01',mod:'M1 – Authentication', feat:'Password Recovery',  type:'Validation',  scenario:'Submit disabled when email is empty',                    pre:'On /forgot-password',              steps:'Open page with empty email field',                                     exp:'Submit button disabled',                                       sev:'Medium'  },
  { id:'TC-AUTH-RECOVERY-02',mod:'M1 – Authentication', feat:'Password Recovery',  type:'Validation',  scenario:'Invalid email rejected',                                 pre:'On /forgot-password',              steps:'Enter invalid email → submit',                                         exp:'Validation error shown',                                       sev:'Medium'  },
  { id:'TC-AUTH-RECOVERY-03',mod:'M1 – Authentication', feat:'Password Recovery',  type:'Functional',  scenario:'Valid email shows success/check-email state',            pre:'On /forgot-password',              steps:'Enter valid email → submit',                                           exp:'Success state shown',                                          sev:'High'    },
  { id:'TC-AUTH-RECOVERY-04',mod:'M1 – Authentication', feat:'Password Recovery',  type:'Navigation',  scenario:'Back to login navigates to /login',                      pre:'On /forgot-password',              steps:'Click "Back to login"',                                                exp:'Navigated to /login',                                          sev:'Low'     },
  { id:'TC-AUTH-REGISTER-01',mod:'M1 – Authentication', feat:'Registration',       type:'Validation',  scenario:'Submit disabled when required fields empty',             pre:'On /register page',                steps:'Open /register with empty fields',                                     exp:'Submit button disabled',                                       sev:'High'    },
  { id:'TC-AUTH-REGISTER-02',mod:'M1 – Authentication', feat:'Registration',       type:'Validation',  scenario:'Short password blocked by policy',                       pre:'On /register page',                steps:'Enter password shorter than minimum → submit',                         exp:'Password policy error shown',                                  sev:'High'    },
  { id:'TC-AUTH-REGISTER-03',mod:'M1 – Authentication', feat:'Registration',       type:'Validation',  scenario:'Terms acceptance required before submission',            pre:'On /register page',                steps:'Fill form, leave terms unchecked → submit',                            exp:'Submit blocked until terms accepted',                           sev:'Medium'  },
  { id:'TC-AUTH-REGISTER-04',mod:'M1 – Authentication', feat:'Registration',       type:'UI',          scenario:'CAPTCHA visible on registration page',                   pre:'On /register page',                steps:'Open /register → check CAPTCHA',                                       exp:'CAPTCHA challenge visible',                                    sev:'Medium'  },
  { id:'TC-AUTH-REGISTER-05',mod:'M1 – Authentication', feat:'Registration',       type:'Navigation',  scenario:'Footer sign-in link navigates to /login',                pre:'On /register page',                steps:'Click footer "Sign in" link',                                          exp:'Navigated to /login',                                          sev:'Low'     },
  { id:'TC-AUTH-REGISTER-06',mod:'M1 – Authentication', feat:'Registration',       type:'UI',          scenario:'Register page exposes only one login link',              pre:'On /register page',                steps:'Count login links on /register',                                       exp:'Exactly one login link',                                       sev:'Low'     },
  { id:'TC-AUTH-REGISTER-07',mod:'M1 – Authentication', feat:'Registration',       type:'Validation',  scenario:'Username below minimum length rejected',                 pre:'On /register page',                steps:'Enter username below minimum → submit',                                exp:'Username length error shown',                                  sev:'High'    },
  { id:'TC-M1-S01',          mod:'M1 – Authentication', feat:'Social Auth',        type:'UI',          scenario:'Social provider button visible on login',                pre:'On /login page',                   steps:'Open /login → check social options',                                   exp:'At least one social provider visible',                         sev:'Medium'  },
  { id:'TC-M1-S02',          mod:'M1 – Authentication', feat:'Social Auth',        type:'UI',          scenario:'Social controls are <button> elements',                  pre:'On /login page',                   steps:'Inspect social login controls',                                        exp:'Controls are button elements',                                 sev:'Low'     },
  { id:'TC-M1-S03',          mod:'M1 – Authentication', feat:'Social Auth',        type:'UI',          scenario:'Social options visible on register page',                pre:'On /register page',                steps:'Open /register → check social options',                                exp:'Social register options visible',                              sev:'Medium'  },
  { id:'TC-M1-T01',          mod:'M1 – Authentication', feat:'Session Tokens',     type:'Security',    scenario:'No tokens stored before login',                          pre:'Not logged in',                    steps:'Open app without login → check storage',                               exp:'No JWT tokens in storage',                                     sev:'High'    },
  { id:'TC-M1-T02',          mod:'M1 – Authentication', feat:'Session Tokens',     type:'Security',    scenario:'Tokens stored after login',                              pre:'Valid credentials',                 steps:'Log in → check localStorage',                                          exp:'Tokens present after login',                                   sev:'Critical' },
  { id:'TC-M1-T03',          mod:'M1 – Authentication', feat:'Session Tokens',     type:'Security',    scenario:'Token matches JWT structure (3 parts)',                  pre:'Logged in',                        steps:'Read access token → validate JWT format',                              exp:'Token is a valid JWT',                                         sev:'High'    },
  { id:'TC-M1-V01',          mod:'M1 – Authentication', feat:'Email Verification', type:'Functional',  scenario:'?verified query opens login page',                       pre:'Verification link used',           steps:'Navigate to /login?verified=true',                                     exp:'Login page loads',                                             sev:'Medium'  },
  { id:'TC-M1-V02',          mod:'M1 – Authentication', feat:'Email Verification', type:'Negative',    scenario:'Invalid token query still loads login',                  pre:'On /login page',                   steps:'Navigate to /login?token=invalid',                                     exp:'Login page loads without crash',                               sev:'Medium'  },
  { id:'TC-M1-V03',          mod:'M1 – Authentication', feat:'Email Verification', type:'Negative',    scenario:'Missing token query still loads login',                  pre:'On /login page',                   steps:'Navigate to /login?token=',                                            exp:'Login page loads without crash',                               sev:'Low'     },
  { id:'TC-M1-V04',          mod:'M1 – Authentication', feat:'Email Verification', type:'Functional',  scenario:'Live registration shows check-email state',              pre:'CAPTCHA solvable',                  steps:'Complete registration → observe result',                               exp:'Check-email state displayed',                                  sev:'High'    },

  // M2 – Profile
  { id:'TC-M2-ACCESS-01',    mod:'M2 – Profile', feat:'Auth Guard',    type:'Security',    scenario:'Guest redirected from /profile',                       pre:'Not logged in',                    steps:'Navigate to /profile without auth',                                    exp:'Redirected to /login or gated',                                sev:'Critical' },
  { id:'TC-M2-EDIT-01',      mod:'M2 – Profile', feat:'Edit Profile',  type:'Functional',  scenario:'Edit modal opens with editable fields',               pre:'Logged in, on /profile',           steps:'Click Edit Profile button',                                            exp:'Modal with editable fields appears',                           sev:'High'    },
  { id:'TC-M2-EDIT-02',      mod:'M2 – Profile', feat:'Edit Profile',  type:'Functional',  scenario:'Avatar input accepts image MIME types',               pre:'Edit modal open',                  steps:'Inspect avatar file input',                                            exp:'Accepts image/* MIME types',                                   sev:'Medium'  },
  { id:'TC-M2-EDIT-03',      mod:'M2 – Profile', feat:'Edit Profile',  type:'Functional',  scenario:'Cover photo input visible and accepts images',        pre:'Edit modal open',                  steps:'Inspect cover file input',                                             exp:'Accepts image/* MIME types',                                   sev:'Medium'  },
  { id:'TC-M2-EDIT-04',      mod:'M2 – Profile', feat:'Edit Profile',  type:'Functional',  scenario:'Cancel closes modal, keeps original name',            pre:'Edit modal open',                  steps:'Click Cancel → observe display name',                                  exp:'Modal closes, name unchanged',                                 sev:'Medium'  },
  { id:'TC-M2-EDIT-05',      mod:'M2 – Profile', feat:'Edit Profile',  type:'Functional',  scenario:'Profile URL is read-only with SoundCloud-style prefix',pre:'Edit modal open',                  steps:'Inspect profile URL field',                                            exp:'Field is read-only',                                           sev:'Low'     },
  { id:'TC-M2-EDIT-06',      mod:'M2 – Profile', feat:'Edit Profile',  type:'Functional',  scenario:'Add link action exposes at least one link input',     pre:'Edit modal open',                  steps:'Click "Add link" action',                                              exp:'At least one link input appears',                              sev:'Low'     },
  { id:'TC-M2-EDIT-07',      mod:'M2 – Profile', feat:'Edit Profile',  type:'Validation',  scenario:'Display name required before submit',                 pre:'Edit modal open',                  steps:'Clear display name → attempt save',                                    exp:'Submit blocked / error shown',                                 sev:'High'    },
  { id:'TC-M2-EDIT-08',      mod:'M2 – Profile', feat:'Edit Profile',  type:'Validation',  scenario:'Bio textarea enforces 500-character limit',           pre:'Edit modal open',                  steps:'Type >500 chars in bio',                                               exp:'Input capped at 500 characters',                               sev:'Medium'  },
  { id:'TC-M2-CARD-01',      mod:'M2 – Profile', feat:'Profile Card',  type:'UI',          scenario:'Profile card visible for authenticated users',        pre:'Logged in, on /profile',           steps:'Open /profile page',                                                   exp:'Profile card visible',                                         sev:'High'    },
  { id:'TC-M2-CARD-02',      mod:'M2 – Profile', feat:'Profile Card',  type:'UI',          scenario:'Profile identity and social counters visible',        pre:'Logged in, on /profile',           steps:'Inspect profile card',                                                 exp:'Name, avatar, follow counts visible',                          sev:'High'    },
  { id:'TC-M2-SAVE-01',      mod:'M2 – Profile', feat:'Save Profile',  type:'Functional',  scenario:'Saving unchanged form yields handled success or error',pre:'Edit modal open',                  steps:'Open edit modal, save without changes',                                exp:'Success toast or handled error shown',                          sev:'Medium'  },
  { id:'TC-M2-SAVE-02',      mod:'M2 – Profile', feat:'Save Profile',  type:'Functional',  scenario:'Display name and bio update persists or shows error', pre:'Edit modal open',                  steps:'Update display name and bio → save',                                   exp:'Changes reflected or handled error',                           sev:'High'    },
  { id:'TC-M2-SAVE-03',      mod:'M2 – Profile', feat:'Save Profile',  type:'Functional',  scenario:'City and country update persists or shows error',     pre:'Edit modal open',                  steps:'Update city/country → save',                                           exp:'Changes reflected or handled error',                           sev:'Medium'  },
  { id:'TC-M2-SAVE-04',      mod:'M2 – Profile', feat:'Save Profile',  type:'Validation',  scenario:'Too-long display name rejected with error',           pre:'Edit modal open',                  steps:'Enter 300-char display name → save',                                   exp:'Validation error shown',                                       sev:'Medium'  },

  // M3 – Social
  { id:'TC-M3-MOD-01', mod:'M3 – Social', feat:'Block User',   type:'Functional', scenario:'Block modal opens from card and closes on cancel',  pre:'Logged in, on social page',  steps:'Open card actions → Block → cancel',                                   exp:'Modal opens, cancel closes it',                                sev:'High'    },
  { id:'TC-M3-MOD-02', mod:'M3 – Social', feat:'Block User',   type:'Functional', scenario:'Blocked users route shows list or handled state',   pre:'Logged in',                  steps:'Navigate to blocked tab',                                              exp:'List or empty state shown',                                    sev:'High'    },
  { id:'TC-M3-MOD-03', mod:'M3 – Social', feat:'Block User',   type:'Functional', scenario:'Edit reason modal accepts text and cancel works',   pre:'Block reason modal open',    steps:'Edit reason text → cancel',                                            exp:'Modal closes without saving',                                  sev:'Medium'  },
  { id:'TC-M3-MOD-04', mod:'M3 – Social', feat:'Block User',   type:'Functional', scenario:'Unblock results in valid blocked-list state',        pre:'User is blocked',            steps:'Unblock the user',                                                     exp:'User removed from blocked list',                               sev:'High'    },
  { id:'TC-M3-NAV-01', mod:'M3 – Social', feat:'Navigation',   type:'Navigation', scenario:'Social tabs navigate to following/followers/blocked',pre:'Logged in',                  steps:'Click each social tab',                                                exp:'Correct route loaded per tab',                                 sev:'Medium'  },
  { id:'TC-M3-NET-01', mod:'M3 – Social', feat:'Network',      type:'Functional', scenario:'Following view shows cards or handled state',        pre:'Logged in',                  steps:'Open following tab',                                                   exp:'User cards or empty state',                                    sev:'High'    },
  { id:'TC-M3-NET-02', mod:'M3 – Social', feat:'Network',      type:'Functional', scenario:'Followers view shows cards or handled state',        pre:'Logged in',                  steps:'Open followers tab',                                                   exp:'User cards or empty state',                                    sev:'High'    },
  { id:'TC-M3-NET-03', mod:'M3 – Social', feat:'Network',      type:'UI',         scenario:'Suggested users panel rendered or absent',           pre:'Logged in',                  steps:'Check suggested panel',                                                exp:'Present or intentionally absent',                              sev:'Low'     },
  { id:'TC-M3-NET-04', mod:'M3 – Social', feat:'Network',      type:'Negative',   scenario:'Impossible filter shows no-match state',             pre:'Logged in',                  steps:'Search "xyzxyzxyz123"',                                                exp:'No results / empty state',                                     sev:'Medium'  },
  { id:'TC-M3-NET-05', mod:'M3 – Social', feat:'Pagination',   type:'Functional', scenario:'Pagination controls valid when shown',               pre:'Many users',                 steps:'Check pagination UI',                                                  exp:'Valid next/prev controls',                                     sev:'Medium'  },
  { id:'TC-M3-REL-01', mod:'M3 – Social', feat:'Follow',       type:'Functional', scenario:'Follow controls on follower cards or handled state', pre:'Logged in',                  steps:'View follower cards → check follow button',                            exp:'Follow button present or handled',                             sev:'High'    },
  { id:'TC-M3-REL-02', mod:'M3 – Social', feat:'Follow',       type:'Functional', scenario:'Follow toggle leaves control in valid state',        pre:'Logged in',                  steps:'Click follow → observe state',                                         exp:'Button reflects new state',                                    sev:'High'    },

  // M4 – Tracks
  { id:'TC-M4-META-01', mod:'M4 – Tracks', feat:'Track Metadata', type:'UI',         scenario:'Track hero title visible on track page',           pre:'On a track page',            steps:'Open /tracks/:id',                                                     exp:'Track title in hero',                                          sev:'High'    },
  { id:'TC-M4-META-02', mod:'M4 – Tracks', feat:'Track Metadata', type:'UI',         scenario:'Artist chip link renders on hero',                  pre:'On a track page',            steps:'Inspect track hero',                                                   exp:'Artist chip/link present',                                     sev:'High'    },
  { id:'TC-M4-META-03', mod:'M4 – Tracks', feat:'Track Metadata', type:'UI',         scenario:'Genre pill renders on track hero',                  pre:'On a track page',            steps:'Inspect hero for genre pill',                                          exp:'Genre/type pill visible',                                      sev:'Medium'  },
  { id:'TC-M4-TRN-01',  mod:'M4 – Tracks', feat:'Track Page',     type:'Functional', scenario:'Track page loads or shows unavailable — not blank', pre:'Track ID exists',            steps:'Navigate to /tracks/:id',                                              exp:'Content or "unavailable" — not blank',                         sev:'Critical' },
  { id:'TC-M4-TRN-02',  mod:'M4 – Tracks', feat:'Track Page',     type:'Robustness', scenario:'Track page never shows blank screen',              pre:'Track ID exists',            steps:'Navigate to /tracks/:id',                                              exp:'No blank/white screen',                                        sev:'Critical' },
  { id:'TC-M4-UPL-01',  mod:'M4 – Tracks', feat:'Upload',         type:'Security',   scenario:'Guest cannot access /upload',                      pre:'Not logged in',              steps:'Navigate to /upload',                                                  exp:'Redirected or gated',                                          sev:'Critical' },
  { id:'TC-M4-UPL-02',  mod:'M4 – Tracks', feat:'Upload',         type:'Functional', scenario:'Upload page renders header and drop zone',         pre:'Logged in',                  steps:'Navigate to /upload',                                                  exp:'Header and upload zone visible',                               sev:'High'    },
  { id:'TC-M4-UPL-03',  mod:'M4 – Tracks', feat:'Upload',         type:'Functional', scenario:'File input accepts mp3 and wav',                   pre:'Logged in, on /upload',      steps:'Inspect file input accept attribute',                                  exp:'Accepts audio/mpeg and audio/wav',                             sev:'High'    },
  { id:'TC-M4-UPL-04',  mod:'M4 – Tracks', feat:'Upload',         type:'Functional', scenario:'Upload shows paywall or upload form',              pre:'Logged in',                  steps:'Open /upload → check state',                                           exp:'Paywall overlay OR upload form shown',                         sev:'High'    },
  { id:'TC-M4-VIS-01',  mod:'M4 – Tracks', feat:'My Tracks',      type:'Functional', scenario:'My-tracks page renders for authenticated user',    pre:'Logged in',                  steps:'Navigate to /my-tracks',                                               exp:'Track list or empty state',                                    sev:'High'    },
  { id:'TC-M4-VIS-02',  mod:'M4 – Tracks', feat:'My Tracks',      type:'Security',   scenario:'Guest cannot access /my-tracks',                  pre:'Not logged in',              steps:'Navigate to /my-tracks',                                               exp:'Redirected or gated',                                          sev:'Critical' },
  { id:'TC-M4-WAV-01',  mod:'M4 – Tracks', feat:'Waveform',       type:'UI',         scenario:'Waveform element renders on track page',           pre:'On a track page',            steps:'Check waveform element',                                               exp:'Waveform present',                                             sev:'High'    },
  { id:'TC-M4-WAV-02',  mod:'M4 – Tracks', feat:'Waveform',       type:'UI',         scenario:'Duration badge renders with time-format text',     pre:'On a track page',            steps:'Check duration badge',                                                 exp:'Badge shows mm:ss or hh:mm:ss',                               sev:'Medium'  },

  // M5 – Playback
  { id:'TC-M5-ACC-01', mod:'M5 – Playback', feat:'Access Tiers',     type:'Functional', scenario:'Playback state chip renders (Playable/Preview/Blocked)', pre:'On a track page', steps:'Open /tracks/:id → check state chip',                                  exp:'Chip shows valid state',                                       sev:'High'    },
  { id:'TC-M5-ACC-02', mod:'M5 – Playback', feat:'Access Tiers',     type:'Robustness', scenario:'Track page handles any playback tier without crash',     pre:'On a track page', steps:'Open track page',                                                      exp:'No JS error on load',                                          sev:'High'    },
  { id:'TC-M5-HIS-01', mod:'M5 – Playback', feat:'History',          type:'Functional', scenario:'/history page renders playback history section',         pre:'Logged in',       steps:'Navigate to /history',                                                 exp:'History section visible',                                      sev:'High'    },
  { id:'TC-M5-HIS-02', mod:'M5 – Playback', feat:'History',          type:'Functional', scenario:'Recently played shows cards or empty state',             pre:'On /history',     steps:'Check recently played grid',                                           exp:'Cards or empty state shown',                                   sev:'High'    },
  { id:'TC-M5-HIS-03', mod:'M5 – Playback', feat:'History',          type:'UI',         scenario:'Filter input visible on history page',                   pre:'On /history',     steps:'Check filter input',                                                   exp:'Filter/search input visible',                                  sev:'Medium'  },
  { id:'TC-M5-RSP-01', mod:'M5 – Playback', feat:'Persistent Player',type:'Functional', scenario:'Player bar persists after navigating away from track',   pre:'Track playing',   steps:'Play track → navigate to home → check bar',                            exp:'Player bar still visible',                                     sev:'Critical' },
  { id:'TC-M5-STR-01', mod:'M5 – Playback', feat:'Streaming',        type:'UI',         scenario:'Play button visible on track hero',                       pre:'On a track page', steps:'Check hero play button',                                               exp:'Play button visible',                                          sev:'High'    },
  { id:'TC-M5-STR-02', mod:'M5 – Playback', feat:'Streaming',        type:'Functional', scenario:'Clicking play changes hero to is-playing state',         pre:'On a track page', steps:'Click play → check state class',                                       exp:'Hero has is-playing state',                                    sev:'Critical' },
  { id:'TC-M5-STR-03', mod:'M5 – Playback', feat:'Seeking',          type:'Functional', scenario:'Waveform present and interactive for seeking',            pre:'On a track page', steps:'Check waveform interactivity',                                         exp:'Waveform visible and clickable',                               sev:'High'    },
  { id:'TC-M5-STR-04', mod:'M5 – Playback', feat:'Persistent Player',type:'UI',         scenario:'Persistent player bar present on the page',              pre:'Track playing',   steps:'Play track → check player bar',                                        exp:'Player bar visible at bottom',                                 sev:'Critical' },

  // M6 – Engagement
  { id:'TC-M6-CMT-01', mod:'M6 – Engagement', feat:'Comments', type:'UI',         scenario:'Comment input bar visible on track page',           pre:'On a track page',          steps:'Check comment input',                                                  exp:'Comment input visible',                                        sev:'High'    },
  { id:'TC-M6-CMT-02', mod:'M6 – Engagement', feat:'Comments', type:'Security',   scenario:'Comment submission blocked for unauthenticated',    pre:'Not logged in',            steps:'Try submitting comment without auth',                                  exp:'Blocked or auth-gated',                                        sev:'High'    },
  { id:'TC-M6-CMT-03', mod:'M6 – Engagement', feat:'Comments', type:'Functional', scenario:'Comments panel renders thread or empty state',       pre:'On a track page',          steps:'Check comments panel',                                                 exp:'Thread or empty state shown',                                  sev:'High'    },
  { id:'TC-M6-CMT-04', mod:'M6 – Engagement', feat:'Comments', type:'UI',         scenario:'Timestamp checkbox visible in comment composer',     pre:'Logged in, track page',    steps:'Check composer for timestamp checkbox',                                exp:'Checkbox visible',                                             sev:'Medium'  },
  { id:'TC-M6-ENG-01', mod:'M6 – Engagement', feat:'Likes',    type:'Functional', scenario:'/tracks/:id/likes renders section panel',           pre:'Logged in',                steps:'Navigate to /tracks/:id/likes',                                        exp:'Likes panel renders',                                          sev:'High'    },
  { id:'TC-M6-ENG-02', mod:'M6 – Engagement', feat:'Reposts',  type:'Functional', scenario:'/tracks/:id/reposts renders section panel',         pre:'Logged in',                steps:'Navigate to /tracks/:id/reposts',                                      exp:'Reposts panel renders',                                        sev:'High'    },
  { id:'TC-M6-LIK-01', mod:'M6 – Engagement', feat:'Likes',    type:'UI',         scenario:'Like button visible in track actions row',           pre:'On a track page',          steps:'Check track actions row',                                              exp:'Like button present',                                          sev:'High'    },
  { id:'TC-M6-LIK-02', mod:'M6 – Engagement', feat:'Likes',    type:'Functional', scenario:'Like button is clickable',                           pre:'Logged in, track page',    steps:'Click like button',                                                    exp:'Click interaction fires',                                      sev:'High'    },
  { id:'TC-M6-LIK-03', mod:'M6 – Engagement', feat:'Likes',    type:'UI',         scenario:'Like count visible on track page',                   pre:'On a track page',          steps:'Check stat row',                                                       exp:'Like count/stat visible',                                      sev:'Medium'  },
  { id:'TC-M6-REP-01', mod:'M6 – Engagement', feat:'Reposts',  type:'UI',         scenario:'Repost button visible in track actions row',         pre:'On a track page',          steps:'Check track actions row',                                              exp:'Repost button present',                                        sev:'High'    },
  { id:'TC-M6-REP-02', mod:'M6 – Engagement', feat:'Reposts',  type:'Functional', scenario:'Repost button is clickable',                         pre:'Logged in, track page',    steps:'Click repost button',                                                  exp:'Click interaction fires',                                      sev:'High'    },

  // M7 – Playlists
  { id:'TC-M7-CRU-01', mod:'M7 – Playlists', feat:'Artist Studio',  type:'Functional', scenario:'Artist Studio renders with track list',           pre:'Logged in',                  steps:'Navigate to /my-tracks',                                               exp:'Track list or handled state',                                  sev:'High'    },
  { id:'TC-M7-CRU-02', mod:'M7 – Playlists', feat:'Add to Playlist',type:'Functional', scenario:'Add-to-playlist shows playlists or create option',pre:'Logged in, track page',      steps:'Open add-to-playlist panel',                                           exp:'Existing playlists or "Create" option',                        sev:'High'    },
  { id:'TC-M7-CRU-03', mod:'M7 – Playlists', feat:'Auth Guard',     type:'Security',   scenario:'Guest cannot access Artist Studio',               pre:'Not logged in',              steps:'Navigate to /my-tracks',                                               exp:'Redirected or gated',                                          sev:'Critical' },
  { id:'TC-M7-CRU-04', mod:'M7 – Playlists', feat:'Create Playlist',type:'Functional', scenario:'Create playlist form has title and privacy',      pre:'Logged in',                  steps:'Open create playlist form',                                            exp:'Title input and privacy options visible',                      sev:'High'    },
  { id:'TC-M7-DET-01', mod:'M7 – Playlists', feat:'Add to Playlist',type:'Functional', scenario:'Add-to-playlist panel opens and shows options',    pre:'Logged in, track page',      steps:'Open add-to-playlist panel',                                           exp:'Panel with playlists or create option',                        sev:'High'    },
  { id:'TC-M7-DET-02', mod:'M7 – Playlists', feat:'Add to Playlist',type:'Functional', scenario:'Creating playlist and adding track shows confirmation',pre:'Logged in',             steps:'Create playlist → add track',                                          exp:'Success confirmation shown',                                   sev:'High'    },
  { id:'TC-M7-DET-03', mod:'M7 – Playlists', feat:'Add to Playlist',type:'Functional', scenario:'Panel shows per-playlist action buttons',         pre:'Has playlists',              steps:'Open add-to-playlist panel',                                           exp:'Action buttons per playlist',                                  sev:'Medium'  },
  { id:'TC-M7-EMB-01', mod:'M7 – Playlists', feat:'Sharing',        type:'Functional', scenario:'Track context menu exposes Copy link',             pre:'On a track page',            steps:'Open track share menu',                                                exp:'"Copy link" action present',                                   sev:'Medium'  },
  { id:'TC-M7-PRV-01', mod:'M7 – Playlists', feat:'Privacy',        type:'Functional', scenario:'Create form offers Public and Private options',    pre:'Create form open',           steps:'Check privacy options',                                                exp:'Both Public and Private available',                            sev:'High'    },
  { id:'TC-M7-PRV-02', mod:'M7 – Playlists', feat:'Privacy',        type:'Functional', scenario:'Selecting Private and saving works',              pre:'Create form open',           steps:'Select Private → save',                                                exp:'Private playlist created',                                     sev:'High'    },

  // M8 – Discovery
  { id:'TC-M8-FED-01', mod:'M8 – Discovery', feat:'Feed',     type:'Functional', scenario:'/feed renders activity feed',                    pre:'Logged in',            steps:'Navigate to /feed',                                                    exp:'Feed page renders',                                            sev:'High'    },
  { id:'TC-M8-FED-02', mod:'M8 – Discovery', feat:'Feed',     type:'Functional', scenario:'Feed shows track cards or follow-prompt',        pre:'Logged in, on /feed',  steps:'Check feed content',                                                   exp:'Cards or follow-prompt/empty state',                           sev:'High'    },
  { id:'TC-M8-FED-03', mod:'M8 – Discovery', feat:'Discover', type:'Functional', scenario:'/discover renders discover shelf layout',        pre:'Logged in',            steps:'Navigate to /discover',                                                exp:'Discover shelf visible',                                       sev:'High'    },
  { id:'TC-M8-RES-01', mod:'M8 – Discovery', feat:'Routing',  type:'Robustness', scenario:'Wildcard route handles unknown paths gracefully',pre:'App running',          steps:'Navigate to /unknown-path-xyz',                                        exp:'404 or graceful fallback',                                     sev:'High'    },
  { id:'TC-M8-SRC-01', mod:'M8 – Discovery', feat:'Search',   type:'Functional', scenario:'/search renders input and filter sidebar',       pre:'Logged in',            steps:'Navigate to /search',                                                  exp:'Search input and sidebar visible',                             sev:'High'    },
  { id:'TC-M8-SRC-02', mod:'M8 – Discovery', feat:'Search',   type:'Functional', scenario:'Keyword search returns results or no-results',   pre:'On /search page',      steps:'Type "test" → submit',                                                 exp:'Results or no-results state shown',                            sev:'High'    },
  { id:'TC-M8-SRC-03', mod:'M8 – Discovery', feat:'Search',   type:'UI',         scenario:'Search filter tabs visible',                     pre:'On /search page',      steps:'Check filter tabs',                                                    exp:'Tracks/Users/Playlists tabs visible',                          sev:'Medium'  },
  { id:'TC-M8-TRD-01', mod:'M8 – Discovery', feat:'Trending', type:'Functional', scenario:'/trending renders charts layout',                pre:'Logged in',            steps:'Navigate to /trending',                                                exp:'Charts layout renders',                                        sev:'High'    },
  { id:'TC-M8-TRD-02', mod:'M8 – Discovery', feat:'Trending', type:'UI',         scenario:'Trending page shows genre tabs',                 pre:'On /trending',         steps:'Check genre tabs',                                                     exp:'Genre tabs visible',                                           sev:'Medium'  },
  { id:'TC-M8-TRD-03', mod:'M8 – Discovery', feat:'Trending', type:'Functional', scenario:'Trending chart list or loader renders',          pre:'On /trending',         steps:'Check chart list area',                                                exp:'List, loader, or handled state',                               sev:'High'    },

  // M9 – Messaging
  { id:'TC-M9-DM-01',  mod:'M9 – Messaging', feat:'Auth Guard',        type:'Security',   scenario:'Guest cannot access /messages',                    pre:'Not logged in',              steps:'Navigate to /messages',                                                exp:'Redirected or gated',                                          sev:'Critical' },
  { id:'TC-M9-DM-02',  mod:'M9 – Messaging', feat:'Messages UI',       type:'Functional', scenario:'Messages page renders for authenticated user',     pre:'Logged in',                  steps:'Navigate to /messages',                                                exp:'Messages layout visible',                                      sev:'High'    },
  { id:'TC-M9-DM-03',  mod:'M9 – Messaging', feat:'Compose',           type:'Functional', scenario:'Compose button opens recipient input modal',       pre:'Logged in, on /messages',    steps:'Click compose button',                                                 exp:'Recipient modal opens',                                        sev:'High'    },
  { id:'TC-M9-DM-04',  mod:'M9 – Messaging', feat:'Conversation List', type:'Functional', scenario:'Sidebar shows conversations or empty state',       pre:'Logged in',                  steps:'Check sidebar in /messages',                                           exp:'List or empty state',                                          sev:'High'    },
  { id:'TC-M9-PRV-01', mod:'M9 – Messaging', feat:'Track Sharing',     type:'Functional', scenario:'Message input area accepts text',                  pre:'Conversation open',          steps:'Type in message input',                                                exp:'Text accepted',                                                sev:'Medium'  },
  { id:'TC-M9-STA-01', mod:'M9 – Messaging', feat:'Unread Badge',      type:'UI',         scenario:'Nav shows unread badge or no badge (both valid)',  pre:'Logged in',                  steps:'Check nav for unread badge',                                           exp:'Badge or no badge — no crash',                                 sev:'Medium'  },

  // M10 – Notifications
  { id:'TC-M10-ACT-01', mod:'M10 – Notifications', feat:'Notifications', type:'Functional', scenario:'/notifications renders for authenticated user', pre:'Logged in',          steps:'Navigate to /notifications',                                           exp:'Page renders',                                                 sev:'High'    },
  { id:'TC-M10-ACT-02', mod:'M10 – Notifications', feat:'Notifications', type:'Functional', scenario:'Page shows items or empty state',              pre:'Logged in',           steps:'Check notifications list',                                             exp:'Items or empty state',                                         sev:'High'    },
  { id:'TC-M10-ACT-03', mod:'M10 – Notifications', feat:'Notification Items', type:'UI',   scenario:'Items show actor, action, and timestamp',      pre:'On /notifications',   steps:'Inspect notification items',                                           exp:'Actor, action, timestamp present',                             sev:'High'    },
  { id:'TC-M10-ACT-04', mod:'M10 – Notifications', feat:'Unread State',  type:'UI',        scenario:'Unread items have .unread class when present',  pre:'Unread notifications',steps:'Check unread items styling',                                           exp:'.unread class applied',                                        sev:'Medium'  },
  { id:'TC-M10-STA-01', mod:'M10 – Notifications', feat:'Filtering',     type:'UI',        scenario:'Filter dropdown visible',                        pre:'On /notifications',   steps:'Check filter dropdown',                                                exp:'Dropdown visible',                                             sev:'Medium'  },
  { id:'TC-M10-STA-02', mod:'M10 – Notifications', feat:'Mark All Read', type:'Functional',scenario:'Mark-all-read clears unread or is gated',       pre:'On /notifications',   steps:'Click mark-all-read',                                                  exp:'Unread cleared or action gated',                               sev:'High'    },
  { id:'TC-M10-STA-03', mod:'M10 – Notifications', feat:'Nav Badge',     type:'UI',        scenario:'Notification bell visible in global nav',        pre:'Logged in',           steps:'Check global nav',                                                     exp:'Bell/icon visible',                                            sev:'Medium'  },

  // M11 – Moderation
  { id:'TC-M11-ADM-01', mod:'M11 – Moderation', feat:'Admin Auth Guard',  type:'Security',   scenario:'/admin not publicly accessible',                   pre:'Not admin',              steps:'Navigate to /admin as non-admin',                                      exp:'Redirected or 403',                                            sev:'Critical' },
  { id:'TC-M11-ADM-02', mod:'M11 – Moderation', feat:'Admin Panel',       type:'Functional', scenario:'Admin panel renders nav and track management',      pre:'Logged in as admin',     steps:'Navigate to /admin',                                                   exp:'Nav and track section visible',                                sev:'High'    },
  { id:'TC-M11-ADM-03', mod:'M11 – Moderation', feat:'Admin Panel',       type:'Functional', scenario:'Moderation section reachable from sidebar',        pre:'Logged in as admin',     steps:'Click moderation in sidebar',                                          exp:'Moderation section opens',                                     sev:'High'    },
  { id:'TC-M11-HLT-01', mod:'M11 – Moderation', feat:'Platform Health',   type:'Functional', scenario:'Health dashboard renders key metrics',              pre:'Logged in as admin',     steps:'Navigate to health dashboard',                                         exp:'Metrics/charts rendered',                                      sev:'High'    },
  { id:'TC-M11-REP-01', mod:'M11 – Moderation', feat:'Report Content',    type:'UI',         scenario:'Flag icon appears on hover over track card',        pre:'On home, logged in',     steps:'Hover over a track card',                                              exp:'Flag icon appears',                                            sev:'Medium'  },
  { id:'TC-M11-REP-02', mod:'M11 – Moderation', feat:'Report Content',    type:'Functional', scenario:'Clicking flag opens report modal with reasons',     pre:'Hovering track card',    steps:'Click flag icon',                                                      exp:'Report modal with reasons opens',                              sev:'High'    },
  { id:'TC-M11-REP-03', mod:'M11 – Moderation', feat:'Report Content',    type:'Functional', scenario:'Submitting report shows confirmation or closes',    pre:'Report modal open',      steps:'Select reason → submit',                                               exp:'Confirmation or modal closes',                                 sev:'High'    },

  // M12 – Premium
  { id:'TC-M12-PAY-01', mod:'M12 – Premium', feat:'Upgrade CTA',  type:'UI',         scenario:'Upgrade/pro CTA visible in nav for free users',   pre:'Free user logged in',        steps:'Check global nav',                                                     exp:'Upgrade/Pro CTA visible',                                      sev:'High'    },
  { id:'TC-M12-PAY-02', mod:'M12 – Premium', feat:'Paywall',      type:'Functional', scenario:'Free user at upload limit sees paywall on /upload', pre:'Free user at limit',         steps:'Navigate to /upload',                                                  exp:'Paywall overlay shown',                                        sev:'High'    },
  { id:'TC-M12-PAY-03', mod:'M12 – Premium', feat:'Pricing Page', type:'Functional', scenario:'Guest accessing pricing page handled gracefully',   pre:'Not logged in',              steps:'Navigate to /upgrade or /pricing',                                     exp:'Page loads gracefully',                                        sev:'Medium'  },
  { id:'TC-M12-PRK-01', mod:'M12 – Premium', feat:'Pro Perks',    type:'Functional', scenario:'Pro user sees download/save option on track page', pre:'Logged in as pro',           steps:'Open a track page',                                                    exp:'Download or save option present',                              sev:'High'    },
  { id:'TC-M12-PRK-02', mod:'M12 – Premium', feat:'Pro Perks',    type:'Functional', scenario:'Pro user has no disruptive upgrade prompts',       pre:'Logged in as pro',           steps:'Browse home page',                                                     exp:'No upgrade banners/prompts',                                   sev:'High'    },
  { id:'TC-M12-PRK-03', mod:'M12 – Premium', feat:'Pro Perks',    type:'Functional', scenario:'Pro user can access offline/save without paywall', pre:'Logged in as pro',           steps:'Try offline/save feature',                                             exp:'No paywall blocked',                                           sev:'High'    },
  { id:'TC-M12-SUB-01', mod:'M12 – Premium', feat:'Subscription', type:'Navigation', scenario:'Upgrade CTA navigates to subscription page',      pre:'Free user logged in',        steps:'Click upgrade CTA',                                                    exp:'Navigated to pricing page',                                    sev:'High'    },
  { id:'TC-M12-SUB-02', mod:'M12 – Premium', feat:'Subscription', type:'Functional', scenario:'Upgrade processes mock payment and reflects pro',  pre:'Free user logged in',        steps:'Click upgrade → complete payment',                                     exp:'Pro status reflected',                                         sev:'Critical' },
  { id:'TC-M12-SUB-03', mod:'M12 – Premium', feat:'Subscription', type:'UI',         scenario:'Subscription page lists Free and Pro plans',      pre:'On pricing page',            steps:'Check plan listing',                                                   exp:'Free and Pro plans listed',                                    sev:'High'    },
];

// ── Build worksheet ───────────────────────────────────────────────────────────
const HEADERS = [
  'Test Case ID', 'Module', 'Feature', 'Test Type',
  'Scenario / Description', 'Preconditions',
  'Test Steps', 'Expected Result',
  'Actual Result', 'Status', 'Severity', 'Notes',
];
const COL_W = [20, 24, 20, 14, 42, 30, 48, 40, 40, 10, 10, 35];

const wb = xlsx.utils.book_new();

// ── Sheet 1 ───────────────────────────────────────────────────────────────────
const rows = [HEADERS];
for (const t of tests) {
  const fail = FAIL.has(t.id);
  const status = fail ? 'FAIL' : 'PASS';
  const actual = fail
    ? `Test failed — ${FAIL_NOTES[t.id] || 'assertion not met'}`
    : 'Behaved as expected — assertion passed';
  const notes = FAIL_NOTES[t.id] || '';
  rows.push([t.id, t.mod, t.feat, t.type, t.scenario, t.pre, t.steps, t.exp, actual, status, t.sev, notes]);
}

const ws = xlsx.utils.aoa_to_sheet(rows);
const range = xlsx.utils.decode_range(ws['!ref']);

for (let R = range.s.r; R <= range.e.r; R++) {
  for (let CC = range.s.c; CC <= range.e.c; CC++) {
    const addr = xlsx.utils.encode_cell({ r: R, c: CC });
    if (!ws[addr]) ws[addr] = { v: '', t: 's' };

    if (R === 0) {
      ws[addr].s = cs(C.headerBg, C.headerFg, true, 11, true, 'center');
    } else {
      const status = rows[R][9];
      let bg = R % 2 === 0 ? 'FFFFFF' : C.altRow;
      let fg = '333333';
      if (CC === 9) {
        bg = status === 'PASS' ? C.pass : C.fail;
        fg = status === 'PASS' ? C.passFont : C.failFont;
      }
      const isBold = CC === 0; // TC ID column bold
      ws[addr].s = cs(bg, fg, isBold, 10, true, CC === 9 ? 'center' : 'left');
    }
  }
}

ws['!cols'] = COL_W.map(w => ({ wch: w }));
ws['!freeze'] = { xSplit: 0, ySplit: 1 };
ws['!autofilter'] = { ref: ws['!ref'] };
xlsx.utils.book_append_sheet(wb, ws, 'Testing Matrix');

// ── Sheet 2: Summary Dashboard ────────────────────────────────────────────────
const total = tests.length;
const passCount = tests.filter(t => !FAIL.has(t.id)).length;
const failCount = FAIL.size;
const passRate = ((passCount / total) * 100).toFixed(1) + '%';

const modules = [...new Set(tests.map(t => t.mod))];
const modRows = modules.map(m => {
  const mt = tests.filter(t => t.mod === m);
  const mp = mt.filter(t => !FAIL.has(t.id)).length;
  const mf = mt.filter(t => FAIL.has(t.id)).length;
  return [m, mt.length, mp, mf, ((mp / mt.length) * 100).toFixed(0) + '%'];
});

const dash = [
  ['PULSIFY — E2E BLACKBOX TESTING SUMMARY', '', '', '', ''],
  ['', '', '', '', ''],
  ['OVERALL RESULTS', '', '', '', ''],
  ['Total Test Cases', total,     '', 'Pass Rate',  passRate],
  ['Passed',          passCount,  '', 'Failed',     failCount],
  ['Skipped',         0,          '', 'Blocked',    0],
  ['', '', '', '', ''],
  ['MODULE BREAKDOWN', 'Total', 'Pass', 'Fail', 'Pass Rate'],
  ...modRows,
  ['', '', '', '', ''],
  ['TEST ENVIRONMENT', '', '', '', ''],
  ['Application URL',  'https://pulsify.page',          '', '', ''],
  ['Test Framework',   'Playwright + Chromium (E2E)',    '', '', ''],
  ['Test Date',        '2026-05-03',                     '', '', ''],
  ['Test Team',        'QA Team — CMPS203 Project',      '', '', ''],
  ['Total Duration',   'Full suite (headless)',           '', '', ''],
];

const ws2 = xlsx.utils.aoa_to_sheet(dash);
const r2   = xlsx.utils.decode_range(ws2['!ref']);
for (let R = r2.s.r; R <= r2.e.r; R++) {
  for (let CC = r2.s.c; CC <= r2.e.c; CC++) {
    const addr = xlsx.utils.encode_cell({ r: R, c: CC });
    if (!ws2[addr]) ws2[addr] = { v: '', t: 's' };
    const v = String(ws2[addr].v || '');
    if (R === 0) {
      ws2[addr].s = cs(C.headerBg, C.headerFg, true, 14, false, 'center');
    } else if (['OVERALL RESULTS','MODULE BREAKDOWN','TEST ENVIRONMENT'].includes(v)) {
      ws2[addr].s = cs(C.subHeaderBg, C.subHeaderFg, true, 11, false, 'left');
    } else if (R === 7) {
      ws2[addr].s = cs(C.headerBg, C.headerFg, true, 10, false, 'center');
    } else {
      let bg = 'FFFFFF', fg = '333333';
      // Colour pass/fail counts in summary
      if (R === 4 && CC === 1) { bg = C.pass; fg = C.passFont; }
      if (R === 4 && CC === 4) { bg = C.fail; fg = C.failFont; }
      ws2[addr].s = cs(bg, fg, CC === 0, 10, false, 'left');
    }
  }
}
ws2['!cols'] = [{ wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
xlsx.utils.book_append_sheet(wb, ws2, 'Summary Dashboard');

// ── Write ─────────────────────────────────────────────────────────────────────
const out = 'd:/CCEE/spring 26/CMPS203 - Software Engineering/Project/pulsify/Testing/Pulsify_Testing_Matrix.xlsx';
xlsx.writeFile(wb, out, { bookType: 'xlsx', compression: true });
console.log(`Written: ${out}`);
console.log(`Total: ${total} | Pass: ${passCount} | Fail: ${failCount} | Rate: ${passRate}`);
