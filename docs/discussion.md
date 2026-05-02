# Phase 3 Discussion Guide (TA Demo)

## 1) Phase 3 Objective

This phase focuses on making Modules 1-3 test-ready with stronger, scenario-based E2E coverage and consistent folder architecture, then extending Module 4, Module 5, and Module 6 benchmark coverage on SoundCloud using the same testing structure style.

## 2) Current Status Snapshot

- Module 1 (Auth): 27 passed, 2 failed, 1 skipped (inside latest integrated run).
- Module 2 (Profile): 15 passed.
- Module 3 (Social Graph): 12 passed.
- Latest integrated Modules 1-3 run: 54 passed, 2 failed, 1 skipped.
- Module 4 SoundCloud benchmark refactor run: 4 passed.
- Module 5 SoundCloud benchmark refactor run: 5 passed.
- Module 6 SoundCloud benchmark refactor run: 4 passed.

## 3) What Was Completed (Modules 1-3)

### Module 1

- Kept TC-based organization across login/register/recovery/social/verification/tokens.
- Confirmed known production defects are still reproducible and documented:
  - Branding text mismatch in auth header.
  - Duplicate login links on register page.

### Module 2

Refactored into scenario folders and support helper:

- access/
- profile-card/
- edit-modal/
- save-flow/
- support/

Coverage includes:

- route protection,
- profile card rendering,
- edit modal field validation,
- upload input constraints,
- cancel/no-save behavior,
- save-flow handled outcomes,
- persistence checks and safe cleanup.

### Module 3

Refactored into scenario folders and support helper:

- navigation/
- relationship-management/
- network-lists/
- moderation/
- support/

Coverage includes:

- route tab navigation,
- follow control behavior,
- suggested users panel,
- filter and pagination handled states,
- block modal behavior,
- blocked users list handling,
- edit reason and unblock flow stability.

## 4) How To Run During TA Demo

## Prerequisites

Use PowerShell in Testing root:

```powershell
Set-Location "d:\CCEE\spring 26\CMPS203 - Software Engineering\Project\pulsify\Testing"
$env:BASE_URL="https://pulsify.page"
$env:TEST_USER_EMAIL="Mohamedtest@test.com"
$env:TEST_USER_PASSWORD="password123"
```

### A) Integrated Modules 1-3 (recommended for demo evidence)

```powershell
npx playwright test e2e/modules/module-01-auth e2e/modules/module-02-profile e2e/modules/module-03-social --project=chromium --reporter=list
```

### B) Run each module individually (terminal mode)

```powershell
npm run test:e2e:m1:terminal
npm run test:e2e:m2:terminal
npm run test:e2e:m3:terminal
```

### C) Run each module individually (Playwright UI mode)

```powershell
npm run test:e2e:m1:ui:script
npm run test:e2e:m2:ui:script
npm run test:e2e:m3:ui:script
```

### D) Run Module 4 benchmark on SoundCloud (terminal mode)

```powershell
npx playwright test e2e/benchmark/soundcloud/module-04-tracks --project=chromium --reporter=list
```

### E) Run Module 5 benchmark on SoundCloud (terminal mode)

```powershell
npx playwright test e2e/benchmark/soundcloud/module-05-playback --project=chromium --reporter=list
```

### F) Run Module 6 benchmark on SoundCloud (terminal mode)

```powershell
npx playwright test e2e/benchmark/soundcloud/module-06-engagement --project=chromium --reporter=list
```

## 5) What To Discuss With Your TA

1. Testing strategy: Pulsify deployment is the acceptance gate, while SoundCloud is used as an external benchmark only.

1. Architecture improvement: Modules 2 and 3 were moved from single-file smoke tests to structured scenario folders with TC naming, and shared helpers were added for maintainable selectors and stable execution behavior.

1. Quality evidence: Show the latest integrated result (54/2/1) and the strengthened module-specific coverage in Module 2 and Module 3.

1. Known open defects (not test flakiness): Module 1 branding bug and Module 1 duplicate register login-link bug remain reproducible.

1. Risk and next steps: Continue deeper business-flow assertions in Modules 4-6 while keeping benchmark and acceptance reporting separated.

## 6) Suggested Talking Script (What To Say)

"In Phase 3, I moved our tests from broad smoke checks to scenario-based coverage with a consistent TC folder architecture. Module 2 and Module 3 are now split by behavior area, which makes traceability and debugging cleaner. I reran Modules 1 through 3 together on the deployed Pulsify environment and got 54 passed, 2 failed, and 1 skipped. The two failures are known UI defects in Module 1, not random test instability. I then extended the same benchmark structure to SoundCloud for Modules 4 through 6, with Module 4 returning 4 passing tests, Module 5 returning 5 passing tests, and Module 6 returning 4 passing tests."

## 7) Module 4 Kickoff (Started in This Phase)

SoundCloud benchmark Module 4 was refactored into:

- visibility/
- metadata/
- playback-surface/
- support/

New benchmark assertions cover:

- public track accessibility,
- metadata visibility signals,
- waveform/seekbar presence,
- play-action readiness signal (pause or auth-gate behavior).

Execution result: 4 passed on SoundCloud benchmark scope.

## 8) Module 5 Kickoff (Started in This Phase)

SoundCloud benchmark Module 5 was refactored into:

- streaming-controls/
- accessibility/
- history-signals/
- responsive-player/
- support/

New benchmark assertions cover:

- core playback controls (play, seek, volume) visibility,
- playable versus auth-gated handled states,
- timeline/history-like playback signals,
- sticky/discoverable player controls after page scroll.

Execution result: 5 passed on SoundCloud module-05 benchmark scope.

## 9) Module 6 Kickoff (Started in This Phase)

SoundCloud benchmark Module 6 was refactored into:

- likes-favorites/
- reposts-share/
- timestamped-comments/
- engagement-lists/
- support/

New benchmark assertions cover:

- likes or favorites action and engagement count signals,
- repost and share signal discoverability,
- timestamped comment surface signals,
- likes/reposts engagement-list visibility signals.

Execution result: 4 passed on SoundCloud module-06 benchmark scope.

## 10) TA Questions You May Get (Quick Answers)

- Why use SoundCloud for Module 4?
  - As a benchmark reference for mature track UX behavior while keeping Pulsify as acceptance.

- Are the two Module 1 failures blockers?
  - They are functional UI defects already isolated with deterministic failing specs.

- Why split folders by scenario?
  - Better traceability, clearer ownership, easier debugging, and cleaner reporting per requirement.
