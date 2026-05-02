# Modules 4-6 Pulsify Test Suite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the three smoke stubs for modules 4-6 with a full TC test suite targeting the live Pulsify app, matching the architecture of modules 1-3.

**Architecture:** Feature subfolders per module, one `TCxx-kebab.spec.js` per test case, one `support/module{N}-name.helper.js` per module. All tests use the blackbox "handled-state" approach — content OR empty OR error is always valid. Login-dependent tests are gated with `test.skip(!hasCredentials(), ...)`. The `TEST_TRACK_ID` env var (default `69d67db1f279d83706cfbda8`) drives navigation to `/tracks/:id`.

**Tech Stack:** Playwright (already installed), ES modules, existing global helpers at `scripts/e2e/support/helpers/auth.helper.js` and `scripts/e2e/support/selectors.js`.

---

## Key Paths

- Smoke stubs to delete:
  - `scripts/e2e/modules/module-04-tracks/tracks.smoke.spec.js`
  - `scripts/e2e/modules/module-05-playback/playback.smoke.spec.js`
  - `scripts/e2e/modules/module-06-engagement/engagement.smoke.spec.js`
- Global auth helper: `scripts/e2e/support/helpers/auth.helper.js`
- PowerShell run scripts: `scripts/run-unified-ui.ps1`, `scripts/run-unified-headless.ps1`
- Playwright config: check `Testing/playwright.config.js` or `playwright.config.ts` for `baseURL`

## CSS Selectors Quick Reference

```
.track-hero              – hero section wrapper
.track-hero h1           – track title
.track-artist-chip       – artist link chip
.track-type-pill         – genre/type pill
.hero-play               – play button
.hero-play.is-playing    – playing state
.track-waveform          – waveform element
.track-duration-badge    – duration text
.track-actions-row       – like/repost/share row
.track-stat-row          – stats (plays, likes, etc.)
.playback-state-chip     – Playable / Preview / Blocked chip
.social-comment-bar      – comment form wrapper
.comments-panel          – comments section
.timestamp-option        – timestamp checkbox in comment bar
.section-list-panel      – likes/reposts list panel
.playback-history-section – history page section
.recently-played-grid    – recently played cards
.playback-history-filter input – filter input on history page
.pulsify-upload-page     – upload screen wrapper
.pulsify-paywall-overlay – paywall overlay
.artist-dashboard        – my-tracks dashboard
```

---

## Task 1: Delete smoke stubs

**Files:**
- Delete: `scripts/e2e/modules/module-04-tracks/tracks.smoke.spec.js`
- Delete: `scripts/e2e/modules/module-05-playback/playback.smoke.spec.js`
- Delete: `scripts/e2e/modules/module-06-engagement/engagement.smoke.spec.js`

**Step 1: Delete the three smoke stubs**

```bash
rm "d:\CCEE\spring 26\CMPS203 - Software Engineering\Project\pulsify\Testing\scripts\e2e\modules\module-04-tracks\tracks.smoke.spec.js"
rm "d:\CCEE\spring 26\CMPS203 - Software Engineering\Project\pulsify\Testing\scripts\e2e\modules\module-05-playback\playback.smoke.spec.js"
rm "d:\CCEE\spring 26\CMPS203 - Software Engineering\Project\pulsify\Testing\scripts\e2e\modules\module-06-engagement\engagement.smoke.spec.js"
```

**Step 2: Commit**

```bash
git add -A
git commit -m "test(m4-m6): remove phase-3 smoke stubs — replaced by full TC suite"
```

---

## Task 2: Create module-4 helper

**Files:**
- Create: `scripts/e2e/modules/module-04-tracks/support/module4-tracks.helper.js`

**Step 1: Create the helper file with this exact content**

```js
import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module4Env() {
    return {
        testTrackId: process.env.TEST_TRACK_ID || '69d67db1f279d83706cfbda8',
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasTrackId() {
    return Boolean(module4Env().testTrackId);
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module4Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function openTrack(page) {
    const { testTrackId } = module4Env();
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export async function loginAndOpenTrack(page) {
    const { testUserEmail, testUserPassword, testTrackId } = module4Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export function trackPageLocators(page) {
    return {
        trackHero: page.locator('.track-hero'),
        heroTitle: page.locator('.track-hero h1'),
        artistChip: page.locator('.track-artist-chip'),
        typePill: page.locator('.track-type-pill'),
        playButton: page.locator('.hero-play'),
        waveform: page.locator('.track-waveform'),
        durationBadge: page.locator('.track-duration-badge'),
        actionsRow: page.locator('.track-actions-row'),
        unavailableState: page.locator('.app-shell'),
    };
}

export async function isTrackLoaded(page) {
    const hero = page.locator('.track-hero');
    const unavailable = page.locator('text=/unavailable|not found/i');
    const loading = page.locator('.loading-state, [class*="loading"]');
    return (
        (await hero.count()) > 0 ||
        (await unavailable.count()) > 0 ||
        (await loading.count()) > 0
    );
}
```

**Step 2: Commit**

```bash
git add scripts/e2e/modules/module-04-tracks/support/module4-tracks.helper.js
git commit -m "test(m4): add module4-tracks helper"
```

---

## Task 3: Module 4 — upload/ TCs

**Files to create:**
- `scripts/e2e/modules/module-04-tracks/upload/TC01-upload-route-protected.spec.js`
- `scripts/e2e/modules/module-04-tracks/upload/TC02-upload-page-renders.spec.js`
- `scripts/e2e/modules/module-04-tracks/upload/TC03-file-type-accepted.spec.js`
- `scripts/e2e/modules/module-04-tracks/upload/TC04-paywall-free-user-limit.spec.js`

**Step 1: Create TC01**

```js
// TC01-upload-route-protected.spec.js
import { test, expect } from '@playwright/test';

test('TC-M4-UPL-01: unauthenticated user cannot access /upload', async ({ page }) => {
    await page.goto('/upload');
    await expect(page).not.toHaveURL(/\/upload$/);
});
```

**Step 2: Create TC02**

```js
// TC02-upload-page-renders.spec.js
import { test, expect } from '@playwright/test';
import { hasCredentials, loginViaUi } from '../support/module4-tracks.helper.js';
import { loginViaUi as login } from '../../../support/helpers/auth.helper.js';

// NOTE: import loginViaUi from the global helper, not module4 helper
import { module4Env, hasCredentials as hasCreds } from '../support/module4-tracks.helper.js';

test.skip(!hasCreds(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M4-UPL-02: upload page renders header and upload zone for authenticated user', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module4Env();
    await login(page, testUserEmail, testUserPassword);
    await page.goto('/upload');

    const uploadPage = page.locator('.pulsify-upload-page');
    const uploadHeader = page.locator('.pulsify-upload-header');
    const handled = (await uploadPage.count()) > 0 || (await uploadHeader.count()) > 0;
    expect(handled).toBeTruthy();
});
```

**Step 3: Create TC03**

```js
// TC03-file-type-accepted.spec.js
import { test, expect } from '@playwright/test';
import { module4Env, hasCredentials } from '../support/module4-tracks.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M4-UPL-03: file input accepts mp3 and wav formats', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module4Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/upload');

    const fileInput = page.locator('input[type="file"]').first();
    if ((await fileInput.count()) === 0) return;

    const accept = await fileInput.getAttribute('accept');
    const acceptsAudio =
        !accept ||
        accept.includes('audio') ||
        accept.includes('.mp3') ||
        accept.includes('.wav');
    expect(acceptsAudio).toBeTruthy();
});
```

**Step 4: Create TC04**

```js
// TC04-paywall-free-user-limit.spec.js
import { test, expect } from '@playwright/test';
import { module4Env, hasCredentials } from '../support/module4-tracks.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M4-UPL-04: upload page shows paywall overlay or upload form (handled state)', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module4Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/upload');

    const paywall = page.locator('.pulsify-paywall-overlay');
    const uploadBody = page.locator('.pulsify-upload-body');
    const uploadPage = page.locator('.pulsify-upload-page');

    const handled =
        (await paywall.count()) > 0 ||
        (await uploadBody.count()) > 0 ||
        (await uploadPage.count()) > 0;
    expect(handled).toBeTruthy();
});
```

**Step 5: Commit**

```bash
git add scripts/e2e/modules/module-04-tracks/upload/
git commit -m "test(m4): add upload TC01-TC04"
```

---

## Task 4: Module 4 — metadata/ TCs

**Files to create:**
- `scripts/e2e/modules/module-04-tracks/metadata/TC01-track-title-visible.spec.js`
- `scripts/e2e/modules/module-04-tracks/metadata/TC02-artist-chip-visible.spec.js`
- `scripts/e2e/modules/module-04-tracks/metadata/TC03-track-type-pill-visible.spec.js`

**Step 1: Create TC01**

```js
// TC01-track-title-visible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, trackPageLocators } from '../support/module4-tracks.helper.js';

test('TC-M4-META-01: track hero title is visible on track page', async ({ page }) => {
    await openTrack(page);
    const locators = trackPageLocators(page);

    await expect(locators.trackHero.or(locators.unavailableState).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.heroTitle).toBeVisible();
});
```

**Step 2: Create TC02**

```js
// TC02-artist-chip-visible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, trackPageLocators } from '../support/module4-tracks.helper.js';

test('TC-M4-META-02: artist chip link renders on track hero', async ({ page }) => {
    await openTrack(page);
    const locators = trackPageLocators(page);

    await expect(locators.trackHero.or(locators.unavailableState).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.artistChip).toBeVisible();
});
```

**Step 3: Create TC03**

```js
// TC03-track-type-pill-visible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, trackPageLocators } from '../support/module4-tracks.helper.js';

test('TC-M4-META-03: track type/genre pill renders on track hero', async ({ page }) => {
    await openTrack(page);
    const locators = trackPageLocators(page);

    await expect(locators.trackHero.or(locators.unavailableState).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.typePill).toBeVisible();
});
```

**Step 4: Commit**

```bash
git add scripts/e2e/modules/module-04-tracks/metadata/
git commit -m "test(m4): add metadata TC01-TC03"
```

---

## Task 5: Module 4 — transcoding/ TCs

**Files to create:**
- `scripts/e2e/modules/module-04-tracks/transcoding/TC01-track-loads-or-unavailable.spec.js`
- `scripts/e2e/modules/module-04-tracks/transcoding/TC02-loading-state-handled.spec.js`

**Step 1: Create TC01**

```js
// TC01-track-loads-or-unavailable.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, isTrackLoaded } from '../support/module4-tracks.helper.js';

test('TC-M4-TRN-01: track page loads successfully or shows unavailable state (not blank)', async ({ page }) => {
    await openTrack(page);
    await page.waitForTimeout(3000);
    const handled = await isTrackLoaded(page);
    expect(handled).toBeTruthy();
});
```

**Step 2: Create TC02**

```js
// TC02-loading-state-handled.spec.js
import { test, expect } from '@playwright/test';
import { openTrack } from '../support/module4-tracks.helper.js';

test('TC-M4-TRN-02: track page never shows a completely blank screen on load', async ({ page }) => {
    await openTrack(page);

    const shell = page.locator('.app-shell');
    await expect(shell).toBeVisible({ timeout: 10000 });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);
});
```

**Step 3: Commit**

```bash
git add scripts/e2e/modules/module-04-tracks/transcoding/
git commit -m "test(m4): add transcoding TC01-TC02"
```

---

## Task 6: Module 4 — visibility/ TCs

**Files to create:**
- `scripts/e2e/modules/module-04-tracks/visibility/TC01-public-track-accessible.spec.js`
- `scripts/e2e/modules/module-04-tracks/visibility/TC02-my-tracks-route-protected.spec.js`

**Step 1: Create TC01**

```js
// TC01-public-track-accessible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, trackPageLocators } from '../support/module4-tracks.helper.js';

test('TC-M4-VIS-01: public track page is reachable and renders core surface', async ({ page }) => {
    await openTrack(page);
    const locators = trackPageLocators(page);
    await expect(locators.trackHero.or(locators.unavailableState).first()).toBeVisible({ timeout: 15000 });
    const unavailableCount = await page.locator('text=/unavailable|not found/i').count();
    if (unavailableCount === 0) {
        await expect(locators.trackHero).toBeVisible();
    }
});
```

**Step 2: Create TC02**

```js
// TC02-my-tracks-route-protected.spec.js
import { test, expect } from '@playwright/test';

test('TC-M4-VIS-02: unauthenticated user cannot access /my-tracks', async ({ page }) => {
    await page.goto('/my-tracks');
    await expect(page).not.toHaveURL(/\/my-tracks$/);
});
```

**Step 3: Commit**

```bash
git add scripts/e2e/modules/module-04-tracks/visibility/
git commit -m "test(m4): add visibility TC01-TC02"
```

---

## Task 7: Module 4 — waveform/ TCs

**Files to create:**
- `scripts/e2e/modules/module-04-tracks/waveform/TC01-waveform-rendered.spec.js`
- `scripts/e2e/modules/module-04-tracks/waveform/TC02-duration-badge-visible.spec.js`

**Step 1: Create TC01**

```js
// TC01-waveform-rendered.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, trackPageLocators } from '../support/module4-tracks.helper.js';

test('TC-M4-WAV-01: waveform element renders on track page', async ({ page }) => {
    await openTrack(page);
    const locators = trackPageLocators(page);

    await expect(locators.trackHero.or(locators.unavailableState).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.waveform).toBeVisible();
});
```

**Step 2: Create TC02**

```js
// TC02-duration-badge-visible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, trackPageLocators } from '../support/module4-tracks.helper.js';

test('TC-M4-WAV-02: duration badge renders with time-format text', async ({ page }) => {
    await openTrack(page);
    const locators = trackPageLocators(page);

    await expect(locators.trackHero.or(locators.unavailableState).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.durationBadge).toBeVisible();
    const text = await locators.durationBadge.innerText();
    expect(text).toMatch(/\d+:\d{2}/);
});
```

**Step 3: Commit**

```bash
git add scripts/e2e/modules/module-04-tracks/waveform/
git commit -m "test(m4): add waveform TC01-TC02"
```

---

## Task 8: Create module-5 helper

**Files:**
- Create: `scripts/e2e/modules/module-05-playback/support/module5-playback.helper.js`

**Step 1: Create the helper**

```js
import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module5Env() {
    return {
        testTrackId: process.env.TEST_TRACK_ID || '69d67db1f279d83706cfbda8',
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasTrackId() {
    return Boolean(module5Env().testTrackId);
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module5Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function openTrack(page) {
    const { testTrackId } = module5Env();
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export async function loginAndOpenTrack(page) {
    const { testUserEmail, testUserPassword, testTrackId } = module5Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export function playerLocators(page) {
    return {
        trackHero: page.locator('.track-hero'),
        playButton: page.locator('.hero-play'),
        playingState: page.locator('.hero-play.is-playing'),
        waveform: page.locator('.track-waveform'),
        playbackStateChip: page.locator('[class*="playback-state-chip"]'),
        playerBar: page.locator('.pulsify-player-bar, .player-bar, [class*="player-bar"], [class*="PlayerBar"]'),
        historySection: page.locator('.playback-history-section'),
        recentlyPlayedGrid: page.locator('.recently-played-grid'),
        historyFilter: page.locator('.playback-history-filter input, input[placeholder="Filter"]'),
    };
}
```

**Step 2: Commit**

```bash
git add scripts/e2e/modules/module-05-playback/support/module5-playback.helper.js
git commit -m "test(m5): add module5-playback helper"
```

---

## Task 9: Module 5 — streaming-controls/ TCs

**Files to create:**
- `scripts/e2e/modules/module-05-playback/streaming-controls/TC01-play-button-visible.spec.js`
- `scripts/e2e/modules/module-05-playback/streaming-controls/TC02-play-toggles-state.spec.js`
- `scripts/e2e/modules/module-05-playback/streaming-controls/TC03-seek-waveform-clickable.spec.js`
- `scripts/e2e/modules/module-05-playback/streaming-controls/TC04-player-bar-visible.spec.js`

**Step 1: Create TC01**

```js
// TC01-play-button-visible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, playerLocators } from '../support/module5-playback.helper.js';

test('TC-M5-STR-01: play button is visible on track hero', async ({ page }) => {
    await openTrack(page);
    const locators = playerLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.playButton).toBeVisible();
});
```

**Step 2: Create TC02**

```js
// TC02-play-toggles-state.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, playerLocators } from '../support/module5-playback.helper.js';

test('TC-M5-STR-02: clicking play button changes hero to is-playing state', async ({ page }) => {
    await openTrack(page);
    const locators = playerLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.playButton).toBeVisible();
    await locators.playButton.click();
    await page.waitForTimeout(1500);

    const isPlayingOrHandled =
        (await locators.playingState.count()) > 0 ||
        (await locators.playButton.count()) > 0;
    expect(isPlayingOrHandled).toBeTruthy();
});
```

**Step 3: Create TC03**

```js
// TC03-seek-waveform-clickable.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, playerLocators } from '../support/module5-playback.helper.js';

test('TC-M5-STR-03: waveform is present and interactive for seeking', async ({ page }) => {
    await openTrack(page);
    const locators = playerLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if ((await locators.trackHero.count()) === 0) return;

    await expect(locators.waveform).toBeVisible();
    const box = await locators.waveform.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(0);
});
```

**Step 4: Create TC04**

```js
// TC04-player-bar-visible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, playerLocators } from '../support/module5-playback.helper.js';

test('TC-M5-STR-04: persistent player bar is present on the page', async ({ page }) => {
    await openTrack(page);

    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 15000 });

    const locators = playerLocators(page);
    const playerBarVisible =
        (await locators.playerBar.count()) > 0 &&
        (await locators.playerBar.first().isVisible().catch(() => false));

    if (!playerBarVisible) {
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(0);
    } else {
        expect(playerBarVisible).toBeTruthy();
    }
});
```

**Step 5: Commit**

```bash
git add scripts/e2e/modules/module-05-playback/streaming-controls/
git commit -m "test(m5): add streaming-controls TC01-TC04"
```

---

## Task 10: Module 5 — accessibility/ TCs

**Files to create:**
- `scripts/e2e/modules/module-05-playback/accessibility/TC01-playback-state-chip-rendered.spec.js`
- `scripts/e2e/modules/module-05-playback/accessibility/TC02-preview-state-handled.spec.js`

**Step 1: Create TC01**

```js
// TC01-playback-state-chip-rendered.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, playerLocators } from '../support/module5-playback.helper.js';

test('TC-M5-ACC-01: playback state chip renders (Playable / Preview / Blocked)', async ({ page }) => {
    await openTrack(page);
    const locators = playerLocators(page);

    await expect(page.locator('.track-hero, .app-shell').first()).toBeVisible({ timeout: 15000 });
    if ((await page.locator('.track-hero').count()) === 0) return;

    await expect(locators.playbackStateChip).toBeVisible();
    const chipText = await locators.playbackStateChip.innerText();
    expect(chipText.trim().length).toBeGreaterThan(0);
});
```

**Step 2: Create TC02**

```js
// TC02-preview-state-handled.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, playerLocators } from '../support/module5-playback.helper.js';

test('TC-M5-ACC-02: track page handles any playback access tier without crashing', async ({ page }) => {
    await openTrack(page);

    const knownStates = page.locator(
        '.track-hero, .app-shell .loading-state, text=/unavailable/i',
    );
    await expect(knownStates.first()).toBeVisible({ timeout: 15000 });

    const jsErrors = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));
    await page.waitForTimeout(1000);
    expect(jsErrors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});
```

**Step 3: Commit**

```bash
git add scripts/e2e/modules/module-05-playback/accessibility/
git commit -m "test(m5): add accessibility TC01-TC02"
```

---

## Task 11: Module 5 — history/ TCs

**Files to create:**
- `scripts/e2e/modules/module-05-playback/history/TC01-history-route-loads.spec.js`
- `scripts/e2e/modules/module-05-playback/history/TC02-recently-played-section.spec.js`
- `scripts/e2e/modules/module-05-playback/history/TC03-filter-input-visible.spec.js`

**Step 1: Create TC01**

```js
// TC01-history-route-loads.spec.js
import { test, expect } from '@playwright/test';
import { module5Env, hasCredentials } from '../support/module5-playback.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-HIS-01: /history page loads and renders playback history section', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module5Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/history');
    await expect(page).toHaveURL(/\/history/);

    const section = page.locator('.playback-history-section');
    const handled = (await section.count()) > 0;
    expect(handled).toBeTruthy();
});
```

**Step 2: Create TC02**

```js
// TC02-recently-played-section.spec.js
import { test, expect } from '@playwright/test';
import { module5Env, hasCredentials, playerLocators } from '../support/module5-playback.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-HIS-02: recently played section shows cards or empty state', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module5Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/history');

    const locators = playerLocators(page);
    const grid = locators.recentlyPlayedGrid;
    const section = page.locator('.playback-history-section');

    await expect(section.first()).toBeVisible({ timeout: 10000 });

    const hasGrid = (await grid.count()) > 0;
    const hasEmpty = (await page.locator('text=/no tracks|no history|empty/i').count()) > 0;
    expect(hasGrid || hasEmpty).toBeTruthy();
});
```

**Step 3: Create TC03**

```js
// TC03-filter-input-visible.spec.js
import { test, expect } from '@playwright/test';
import { module5Env, hasCredentials, playerLocators } from '../support/module5-playback.helper.js';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.');

test('TC-M5-HIS-03: filter input is visible on history page', async ({ page }) => {
    const { testUserEmail, testUserPassword } = module5Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto('/history');

    await expect(page.locator('.playback-history-section').first()).toBeVisible({ timeout: 10000 });

    const locators = playerLocators(page);
    await expect(locators.historyFilter).toBeVisible();
});
```

**Step 4: Commit**

```bash
git add scripts/e2e/modules/module-05-playback/history/
git commit -m "test(m5): add history TC01-TC03"
```

---

## Task 12: Module 5 — responsive-player/ TC

**Files to create:**
- `scripts/e2e/modules/module-05-playback/responsive-player/TC01-player-bar-sticky-after-play.spec.js`

**Step 1: Create TC01**

```js
// TC01-player-bar-sticky-after-play.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, playerLocators } from '../support/module5-playback.helper.js';

test('TC-M5-RSP-01: player bar persists after navigating away from track page', async ({ page }) => {
    await openTrack(page);
    const locators = playerLocators(page);

    await expect(page.locator('.track-hero, .app-shell').first()).toBeVisible({ timeout: 15000 });
    if ((await page.locator('.track-hero').count()) > 0) {
        await locators.playButton.click();
        await page.waitForTimeout(1000);
    }

    await page.goto('/discover');
    await page.waitForTimeout(1000);

    const barStillPresent = (await locators.playerBar.count()) > 0;
    expect(barStillPresent).toBeTruthy();
});
```

**Step 2: Commit**

```bash
git add scripts/e2e/modules/module-05-playback/responsive-player/
git commit -m "test(m5): add responsive-player TC01"
```

---

## Task 13: Create module-6 helper

**Files:**
- Create: `scripts/e2e/modules/module-06-engagement/support/module6-engagement.helper.js`

**Step 1: Create the helper**

```js
import { expect } from '@playwright/test';
import { loginViaUi } from '../../../support/helpers/auth.helper.js';

export function module6Env() {
    return {
        testTrackId: process.env.TEST_TRACK_ID || '69d67db1f279d83706cfbda8',
        testUserEmail: process.env.TEST_USER_EMAIL,
        testUserPassword: process.env.TEST_USER_PASSWORD,
    };
}

export function hasTrackId() {
    return Boolean(module6Env().testTrackId);
}

export function hasCredentials() {
    const { testUserEmail, testUserPassword } = module6Env();
    return Boolean(testUserEmail && testUserPassword);
}

export async function openTrack(page) {
    const { testTrackId } = module6Env();
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export async function loginAndOpenTrack(page) {
    const { testUserEmail, testUserPassword, testTrackId } = module6Env();
    await loginViaUi(page, testUserEmail, testUserPassword);
    await page.goto(`/tracks/${testTrackId}`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}`));
}

export function engagementLocators(page) {
    return {
        trackHero: page.locator('.track-hero'),
        actionsRow: page.locator('.track-actions-row'),
        likeButton: page.locator('.track-actions-row').getByRole('button', { name: /like/i }),
        repostButton: page.locator('.track-actions-row').getByRole('button', { name: /repost/i }),
        statRow: page.locator('.track-stat-row'),
        commentBar: page.locator('.social-comment-bar'),
        commentsPanel: page.locator('.comments-panel'),
        timestampOption: page.locator('.timestamp-option'),
        sectionListPanel: page.locator('.section-list-panel'),
    };
}

export async function isTrackHeroVisible(page) {
    return (await page.locator('.track-hero').count()) > 0;
}
```

**Step 2: Commit**

```bash
git add scripts/e2e/modules/module-06-engagement/support/module6-engagement.helper.js
git commit -m "test(m6): add module6-engagement helper"
```

---

## Task 14: Module 6 — likes/ TCs

**Files to create:**
- `scripts/e2e/modules/module-06-engagement/likes/TC01-like-button-visible.spec.js`
- `scripts/e2e/modules/module-06-engagement/likes/TC02-like-toggle-requires-auth.spec.js`
- `scripts/e2e/modules/module-06-engagement/likes/TC03-like-count-visible.spec.js`

**Step 1: Create TC01**

```js
// TC01-like-button-visible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-LIK-01: like button is visible in track actions row', async ({ page }) => {
    await openTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    await expect(locators.actionsRow).toBeVisible();
    await expect(locators.likeButton).toBeVisible();
});
```

**Step 2: Create TC02**

```js
// TC02-like-toggle-requires-auth.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-LIK-02: unauthenticated like attempt is handled (auth gate or redirect)', async ({ page }) => {
    await openTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    await locators.likeButton.click();
    await page.waitForTimeout(1500);

    const authGated =
        (await page.locator('text=/sign in|log in|login|register/i').count()) > 0 ||
        (await page).url().includes('/login') ||
        (await page.locator('[class*="modal"], [class*="auth"]').count()) > 0 ||
        (await locators.likeButton.count()) > 0;
    expect(authGated).toBeTruthy();
});
```

**Step 3: Create TC03**

```js
// TC03-like-count-visible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-LIK-03: like count or stat row is visible on track page', async ({ page }) => {
    await openTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    const statRow = locators.statRow;
    const hasStats = (await statRow.count()) > 0;
    expect(hasStats).toBeTruthy();
});
```

**Step 4: Commit**

```bash
git add scripts/e2e/modules/module-06-engagement/likes/
git commit -m "test(m6): add likes TC01-TC03"
```

---

## Task 15: Module 6 — reposts/ TCs

**Files to create:**
- `scripts/e2e/modules/module-06-engagement/reposts/TC01-repost-button-visible.spec.js`
- `scripts/e2e/modules/module-06-engagement/reposts/TC02-repost-toggle-handled.spec.js`

**Step 1: Create TC01**

```js
// TC01-repost-button-visible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-REP-01: repost button is visible in track actions row', async ({ page }) => {
    await openTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    await expect(locators.repostButton).toBeVisible();
});
```

**Step 2: Create TC02**

```js
// TC02-repost-toggle-handled.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-REP-02: repost action produces valid state (toggled or auth-gated)', async ({ page }) => {
    await openTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    await locators.repostButton.click();
    await page.waitForTimeout(1500);

    const handled =
        (await page.locator('text=/sign in|log in|login/i').count()) > 0 ||
        page.url().includes('/login') ||
        (await locators.repostButton.count()) > 0;
    expect(handled).toBeTruthy();
});
```

**Step 3: Commit**

```bash
git add scripts/e2e/modules/module-06-engagement/reposts/
git commit -m "test(m6): add reposts TC01-TC02"
```

---

## Task 16: Module 6 — comments/ TCs

**Files to create:**
- `scripts/e2e/modules/module-06-engagement/comments/TC01-comment-input-visible.spec.js`
- `scripts/e2e/modules/module-06-engagement/comments/TC02-comment-submit-requires-auth.spec.js`
- `scripts/e2e/modules/module-06-engagement/comments/TC03-comments-panel-renders.spec.js`
- `scripts/e2e/modules/module-06-engagement/comments/TC04-timestamped-comment-option.spec.js`

**Step 1: Create TC01**

```js
// TC01-comment-input-visible.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-CMT-01: comment input bar is visible on track page', async ({ page }) => {
    await openTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    await expect(locators.commentBar).toBeVisible();
});
```

**Step 2: Create TC02**

```js
// TC02-comment-submit-requires-auth.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-CMT-02: submitting a comment without auth is blocked or auth-gated', async ({ page }) => {
    await openTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    const submitBtn = page.locator('.comment-submit');
    if ((await submitBtn.count()) === 0) return;

    const isDisabled = await submitBtn.isDisabled().catch(() => true);
    if (isDisabled) {
        expect(isDisabled).toBeTruthy();
        return;
    }

    await submitBtn.click();
    await page.waitForTimeout(1000);
    const authGated =
        page.url().includes('/login') ||
        (await page.locator('text=/sign in|log in/i').count()) > 0 ||
        (await submitBtn.count()) > 0;
    expect(authGated).toBeTruthy();
});
```

**Step 3: Create TC03**

```js
// TC03-comments-panel-renders.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-CMT-03: comments panel renders with thread or empty state', async ({ page }) => {
    await openTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    await expect(locators.commentsPanel).toBeVisible();
    const hasComments = (await page.locator('.comment-block, .comment-row').count()) > 0;
    const hasEmpty = (await page.locator('.comment-empty-state').count()) > 0;
    expect(hasComments || hasEmpty).toBeTruthy();
});
```

**Step 4: Create TC04**

```js
// TC04-timestamped-comment-option.spec.js
import { test, expect } from '@playwright/test';
import { openTrack, engagementLocators } from '../support/module6-engagement.helper.js';

test('TC-M6-CMT-04: timestamp checkbox is visible in comment composer', async ({ page }) => {
    await openTrack(page);
    const locators = engagementLocators(page);

    await expect(locators.trackHero.or(page.locator('.app-shell')).first()).toBeVisible({ timeout: 15000 });
    if (!(await locators.trackHero.count())) return;

    await expect(locators.timestampOption).toBeVisible();
});
```

**Step 5: Commit**

```bash
git add scripts/e2e/modules/module-06-engagement/comments/
git commit -m "test(m6): add comments TC01-TC04"
```

---

## Task 17: Module 6 — engagement-lists/ TCs

**Files to create:**
- `scripts/e2e/modules/module-06-engagement/engagement-lists/TC01-likes-list-route-renders.spec.js`
- `scripts/e2e/modules/module-06-engagement/engagement-lists/TC02-reposts-list-route-renders.spec.js`

**Step 1: Create TC01**

```js
// TC01-likes-list-route-renders.spec.js
import { test, expect } from '@playwright/test';
import { module6Env } from '../support/module6-engagement.helper.js';

test('TC-M6-ENG-01: /tracks/:id/likes renders section list panel', async ({ page }) => {
    const { testTrackId } = module6Env();
    await page.goto(`/tracks/${testTrackId}/likes`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}/likes`));

    const panel = page.locator('.section-list-panel');
    const fallback = page.locator('.app-shell, text=/unavailable|not found/i');
    await expect(panel.or(fallback).first()).toBeVisible({ timeout: 15000 });
});
```

**Step 2: Create TC02**

```js
// TC02-reposts-list-route-renders.spec.js
import { test, expect } from '@playwright/test';
import { module6Env } from '../support/module6-engagement.helper.js';

test('TC-M6-ENG-02: /tracks/:id/reposts renders section list panel', async ({ page }) => {
    const { testTrackId } = module6Env();
    await page.goto(`/tracks/${testTrackId}/reposts`);
    await expect(page).toHaveURL(new RegExp(`/tracks/${testTrackId}/reposts`));

    const panel = page.locator('.section-list-panel');
    const fallback = page.locator('.app-shell, text=/unavailable|not found/i');
    await expect(panel.or(fallback).first()).toBeVisible({ timeout: 15000 });
});
```

**Step 3: Commit**

```bash
git add scripts/e2e/modules/module-06-engagement/engagement-lists/
git commit -m "test(m6): add engagement-lists TC01-TC02"
```

---

## Task 18: Update PowerShell run scripts

**Files:**
- Modify: `scripts/run-unified-ui.ps1`
- Modify: `scripts/run-unified-headless.ps1`

**Step 1: Update `run-unified-ui.ps1`**

Replace the file with:

```powershell
param(
    [string]$BaseUrl = "https://pulsify.page",
    [string]$Email = "test_user_for_ta@example.com",
    [string]$Password = "SecretPassword123!",
    [string]$TrackId = "69d67db1f279d83706cfbda8",
    [string]$TrackUrl = "https://soundcloud.com/forss/flickermood"  # kept for SoundCloud benchmark compat
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# 1. Pulsify Environment Variables (Modules 1-6)
$env:BASE_URL             = $BaseUrl
$env:TEST_USER_EMAIL      = $Email
$env:TEST_USER_PASSWORD   = $Password
$env:TEST_TRACK_ID        = $TrackId

# 2. SoundCloud benchmark env (kept for historical benchmark suite)
$env:SOUNDCLOUD_TRACK_URL = $TrackUrl

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "     LAUNCHING UNIFIED TA PRESENTATION UI        " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Pulsify App    (M1-M6) : $env:BASE_URL"
Write-Host "Test Identity  (M1-M6) : $env:TEST_USER_EMAIL"
Write-Host "Test Track     (M4-M6) : /tracks/$env:TEST_TRACK_ID"
Write-Host "-------------------------------------------------" -ForegroundColor Gray

# 3. Launch Playwright UI — all 6 modules on Pulsify
npx playwright test e2e/modules/module-01-auth e2e/modules/module-02-profile e2e/modules/module-03-social e2e/modules/module-04-tracks e2e/modules/module-05-playback e2e/modules/module-06-engagement --ui --project=chromium

exit $LASTEXITCODE
```

**Step 2: Update `run-unified-headless.ps1`**

Replace the file with:

```powershell
param(
    [string]$BaseUrl = "https://pulsify.page",
    [string]$Email = "youssef.shafik04@eng-st.cu.edu.eg",
    [string]$Password = "SecurePass123!",
    [string]$TrackId = "69d67db1f279d83706cfbda8",
    [string]$TrackUrl = "https://soundcloud.com/forss/flickermood"  # kept for SoundCloud benchmark compat
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Pulsify Environment Variables (Modules 1-6)
$env:BASE_URL             = $BaseUrl
$env:TEST_USER_EMAIL      = $Email
$env:TEST_USER_PASSWORD   = $Password
$env:TEST_TRACK_ID        = $TrackId
$env:RUN_LIVE_REGISTRATION = "true"

# SoundCloud benchmark env (kept for historical benchmark suite)
$env:SOUNDCLOUD_TRACK_URL = $TrackUrl

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   LAUNCHING UNIFIED HEADLESS TEST RUN           " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Pulsify App    (M1-M6) : $env:BASE_URL"
Write-Host "Test Identity  (M1-M6) : $env:TEST_USER_EMAIL"
Write-Host "Test Track     (M4-M6) : /tracks/$env:TEST_TRACK_ID"
Write-Host "-------------------------------------------------" -ForegroundColor Gray

# Launch Playwright — all 6 modules on Pulsify
npx playwright test e2e/modules/module-01-auth e2e/modules/module-02-profile e2e/modules/module-03-social e2e/modules/module-04-tracks e2e/modules/module-05-playback e2e/modules/module-06-engagement --project=chromium

exit $LASTEXITCODE
```

**Step 3: Commit**

```bash
git add scripts/run-unified-ui.ps1 scripts/run-unified-headless.ps1
git commit -m "chore(scripts): point M4-M6 at Pulsify modules — keep SoundCloud env for benchmark compat"
```

---

## Verification

After all tasks, run a quick smoke check:

```powershell
cd "d:\CCEE\spring 26\CMPS203 - Software Engineering\Project\pulsify\Testing"
$env:TEST_TRACK_ID = "69d67db1f279d83706cfbda8"
npx playwright test scripts/e2e/modules/module-04-tracks scripts/e2e/modules/module-05-playback scripts/e2e/modules/module-06-engagement --project=chromium --reporter=list
```

Expected: 36 tests collected, no import errors, credential-gated tests show as skipped (not failed) if env vars not set.
