# Design: Modules 4-6 Pulsify Test Suite (Phase 4)

**Date:** 2026-04-29  
**Author:** Testing Team  
**Status:** Approved

## Context

Phase 3 tested modules 4-6 against SoundCloud as a benchmark (frontend not yet integrated).  
Phase 4: frontend has confirmed full integration of all modules. This design replaces the three
smoke stubs in `scripts/e2e/modules/module-04/05/06` with a full TC structure matching modules 1-3.

SoundCloud benchmark folders are preserved untouched for historical reference.

## Approach

Option A — Mirror modules 1-3 exactly (feature subfolders + individual TC files).  
Each module gets feature-named subfolders, one `TCxx-kebab.spec.js` per test case, and a
`support/module{N}-{name}.helper.js`.

## Environment Variables

| Variable | Purpose |
|---|---|
| `TEST_TRACK_ID` | Pulsify track ID for M4/M5/M6 tests. Default: `69d67db1f279d83706cfbda8` |
| `TEST_USER_EMAIL` | Existing test account email (shared with M1-M3) |
| `TEST_USER_PASSWORD` | Existing test account password (shared with M1-M3) |

## Architecture

```
scripts/e2e/modules/
  module-04-tracks/
    upload/
      TC01-upload-route-protected.spec.js
      TC02-upload-page-renders.spec.js
      TC03-file-type-accepted.spec.js
      TC04-paywall-free-user-limit.spec.js
    metadata/
      TC01-track-title-visible.spec.js
      TC02-artist-chip-visible.spec.js
      TC03-track-type-pill-visible.spec.js
    transcoding/
      TC01-track-loads-or-unavailable.spec.js
      TC02-loading-state-handled.spec.js
    visibility/
      TC01-public-track-accessible.spec.js
      TC02-my-tracks-route-protected.spec.js
    waveform/
      TC01-waveform-rendered.spec.js
      TC02-duration-badge-visible.spec.js
    support/
      module4-tracks.helper.js

  module-05-playback/
    streaming-controls/
      TC01-play-button-visible.spec.js
      TC02-play-toggles-state.spec.js
      TC03-seek-waveform-clickable.spec.js
      TC04-player-bar-visible.spec.js
    accessibility/
      TC01-playback-state-chip-rendered.spec.js
      TC02-preview-state-handled.spec.js
    history/
      TC01-history-route-loads.spec.js
      TC02-recently-played-section.spec.js
      TC03-filter-input-visible.spec.js
    responsive-player/
      TC01-player-bar-sticky-after-play.spec.js
    support/
      module5-playback.helper.js

  module-06-engagement/
    likes/
      TC01-like-button-visible.spec.js
      TC02-like-toggle-requires-auth.spec.js
      TC03-like-count-visible.spec.js
    reposts/
      TC01-repost-button-visible.spec.js
      TC02-repost-toggle-handled.spec.js
    comments/
      TC01-comment-input-visible.spec.js
      TC02-comment-submit-requires-auth.spec.js
      TC03-comments-panel-renders.spec.js
      TC04-timestamped-comment-option.spec.js
    engagement-lists/
      TC01-likes-list-route-renders.spec.js
      TC02-reposts-list-route-renders.spec.js
    support/
      module6-engagement.helper.js
```

## Helper Contract

Each `support/module{N}-{name}.helper.js` exports:

```js
module{N}Env()           // reads TEST_TRACK_ID, TEST_USER_EMAIL, TEST_USER_PASSWORD
hasTrackId()             // boolean gate for track-dependent tests
hasCredentials()         // boolean gate for login-dependent tests
loginAndOpenTrack(page)  // loginViaUi → goto /tracks/:TEST_TRACK_ID
trackPageLocators(page)  // returns object of key locators for the track page
```

## CSS Selectors Reference (from live frontend source)

| Element | Selector |
|---|---|
| Track hero section | `.track-hero` |
| Track title | `.track-hero h1` (via `TrackHeader`) |
| Artist chip | `.track-artist-chip` |
| Track type pill | `.track-type-pill` |
| Play button | `.hero-play` |
| Playing state | `.hero-play.is-playing` |
| Waveform | `.track-waveform` |
| Duration badge | `.track-duration-badge` |
| Actions row | `.track-actions-row` |
| Playback state chip | `.playback-state-chip` |
| Stat row | `.track-stat-row` |
| Comment input | `.social-comment-bar textarea, .social-comment-bar input` |
| Comments panel | `.comments-panel` |
| Timestamp option | `.timestamp-option` |
| Section list panel (likes/reposts) | `.section-list-panel` |
| History section | `.playback-history-section` |
| Recently played grid | `.recently-played-grid` |
| History filter | `.playback-history-filter input` |
| Upload page | `.pulsify-upload-page` |
| Upload paywall | `.pulsify-paywall-overlay` |
| My tracks dashboard | `.artist-dashboard` |

## Routes Reference

| Module | Route | Notes |
|---|---|---|
| M4 | `/tracks/:trackId` | Main track page |
| M4 | `/upload` | Protected — artist only |
| M4 | `/my-tracks` | Protected — artist only |
| M5 | `/tracks/:trackId` | Playback on track page |
| M5 | `/history` | Playback history |
| M5 | `/recently-played` | Recently played (alias) |
| M6 | `/tracks/:trackId` | Likes/reposts/comments on track page |
| M6 | `/tracks/:trackId/likes` | Engagement list — likers |
| M6 | `/tracks/:trackId/reposts` | Engagement list — reposters |
| M6 | `/tracks/:trackId/comments` | Full comments view |

## Blackbox Testing Philosophy

- Tests never assume live data exists — always check content OR empty OR error OR skeleton
- Login-required tests use `test.skip(!hasCredentials(), 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD first.')`
- Track-dependent tests use `test.skip(!hasTrackId(), 'Set TEST_TRACK_ID first.')`
- No hardcoded track IDs in spec files — always read from env via helper

## Script Updates (final step)

`run-unified-ui.ps1` and `run-unified-headless.ps1`:
- Add `$env:TEST_TRACK_ID` param (default `69d67db1f279d83706cfbda8`)
- Replace `e2e/benchmark/soundcloud/module-04/05/06` paths with `e2e/modules/module-04/05/06`
- Keep `$env:SOUNDCLOUD_TRACK_URL` for backward compat (SoundCloud folders preserved)

## Totals

- 3 helper files
- 36 TC spec files
- 3 smoke stubs deleted
- 2 PowerShell scripts updated
