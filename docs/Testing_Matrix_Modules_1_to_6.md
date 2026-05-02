# Testing Matrix (Modules 1-6)

## What is a Testing Matrix?

A testing matrix is a coverage map that links:

- module or feature scope,
- test levels or test types,
- test artifacts (spec files),
- execution status and evidence.

It helps answer: what is tested, how it is tested, where the tests are, and what is still missing.

## Module Coverage Matrix

| Module | Feature Scope | E2E Spec Location | Current Status | Notes |
| --- | --- | --- | --- | --- |
| Module 1 | Authentication and User Management | e2e/modules/module-01-auth | Active | TC-prefixed filename ordering applied across login, register, recovery, social, verification, and tokens. Latest evidence (2026-04-12, chromium, BASE_URL=[https://pulsify.page](https://pulsify.page)): module-01 segment in integrated run = 27 passed, 2 failed, 1 skipped. Manual live run of TC-M1-V04 passed on 2026-04-12 (chromium, headed, CAPTCHA completed). |
| Module 2 | User Profile and Social Identity | e2e/modules/module-02-profile/(access, profile-card, edit-modal, save-flow, support) | Active | Split to Module 1-style folder architecture with TC-prefixed specs. Expanded corner-case coverage includes modal validation, client-side constraints, cancel/no-save behavior, and save-flow handled outcomes (persisted update or explicit error state). Latest run (2026-04-12, chromium, BASE_URL=[https://pulsify.page](https://pulsify.page)): 15 passed. |
| Module 3 | Followers and Social Graph | e2e/modules/module-03-social/(navigation, relationship-management, network-lists, moderation, support) | Active | Split to Module 1-style folder architecture with TC-prefixed specs. Expanded corner-case coverage for follow controls, list filtering/pagination, suggested users visibility, block modal behavior, and blocked-list management handled states. Latest run (2026-04-12, chromium, BASE_URL=[https://pulsify.page](https://pulsify.page)): 12 passed. |
| Module 4 | Audio Upload and Track Management | e2e/modules/module-04-tracks + e2e/benchmark/soundcloud/module-04-tracks/(visibility, metadata, playback-surface, support) | Active | Pulsify smoke remains in place; SoundCloud benchmark was refactored to Module 1-style TC architecture for Phase 3 kickoff. Latest SoundCloud module-04 benchmark run (2026-04-12, chromium): 4 passed. |
| Module 5 | Playback and Streaming Engine | e2e/modules/module-05-playback + e2e/benchmark/soundcloud/module-05-playback/(streaming-controls, accessibility, history-signals, responsive-player, support) | Active | Pulsify smoke remains in place; SoundCloud benchmark was refactored to Module 1-style TC architecture for Phase 3 extension. Latest SoundCloud module-05 benchmark run (2026-04-12, chromium): 5 passed. |
| Module 6 | Engagement and Social Interactions | e2e/modules/module-06-engagement + e2e/benchmark/soundcloud/module-06-engagement/(likes-favorites, reposts-share, timestamped-comments, engagement-lists, support) | Active | Pulsify smoke remains in place; SoundCloud benchmark was refactored to Module 1-style TC architecture for Phase 3 extension. Latest SoundCloud module-06 benchmark run (2026-04-12, chromium): 4 passed. |

## Latest Execution Snapshot

| Date | Scope | Environment | Browser | Result |
| --- | --- | --- | --- | --- |
| 2026-04-12 | SoundCloud benchmark module-06 refactored suite | [https://soundcloud.com](https://soundcloud.com) | chromium | 4 passed |
| 2026-04-12 | SoundCloud benchmark module-05 refactored suite | [https://soundcloud.com](https://soundcloud.com) | chromium | 5 passed |
| 2026-04-12 | SoundCloud benchmark module-04 refactored suite | [https://soundcloud.com](https://soundcloud.com) | chromium | 4 passed |
| 2026-04-12 | Module 1-3 integrated bundle (latest) | [https://pulsify.page](https://pulsify.page) | chromium | 54 passed, 2 failed, 1 skipped |
| 2026-04-12 | Module 3 refactored social-graph suite | [https://pulsify.page](https://pulsify.page) | chromium | 12 passed |
| 2026-04-12 | Module 2 refactored corner-case suite | [https://pulsify.page](https://pulsify.page) | chromium | 15 passed |
| 2026-04-11 | Module 1-3 integrated bundle | [https://pulsify.page](https://pulsify.page) | chromium | 35 passed, 2 failed, 1 skipped |
| 2026-04-11 | Module 4-6 smoke bundle | [https://pulsify.page](https://pulsify.page) | chromium | 6 passed |
| 2026-04-12 | Module 1 verification TC-M1-V04 live registration (manual CAPTCHA) | [https://pulsify.page](https://pulsify.page) | chromium headed | 1 passed |
| 2026-04-12 | SoundCloud benchmark (modules 4-6) | [https://soundcloud.com](https://soundcloud.com) | chromium | 3 passed |

### Open Failure Signals (Module 1)

- Auth header brand still shows SoundCloud instead of Pulsify.
- Failing spec file: e2e/modules/module-01-auth/login/TC04-pulsify-branding.spec.js
- Register page exposes duplicate login links in current deployed UI.
- Failing spec file: e2e/modules/module-01-auth/register/TC06-login-link-uniqueness.spec.js

## Environment Strategy (Recommended)

- Use Pulsify deployment as the acceptance gate for modules 1 to 6.
- Use SoundCloud as a benchmarking reference only for exploratory comparisons, not pass/fail criteria.
- Keep automated CI status tied to Pulsify-hosted behavior to avoid cross-product selector and UX mismatches.

## Recommended Status Workflow

Use one of the following values in test planning:

- Planned
- Scaffolded
- Active
- Stable
- Blocked

## Evidence Expectations Per Module

For each module, maintain:

- Playwright run output or HTML report link,
- defect list (open/closed) with issue IDs,
- environment used (BASE_URL and date),
- pass or fail summary by scenario.
