<!-- markdownlint-disable MD033 MD041 -->
<div class="cover-page">
  <div class="cover-top">Cairo University<br>Credit Hours System<br>Faculty of Engineering</div>
  <div class="cover-course">CMPS203 - Software Engineering</div>
  <h1 class="cover-title">Phase 3 Testing Report - Pulsify</h1>
  <div class="cover-subtitle">CMPS203 - Software Engineering - Spring 2026</div>
  <div class="cover-authors">Prepared by: Mahmoud Attia (Testing Team Leader)<br>Part II contribution by: Youssif Mohamed Abdelfattah</div>
  <div class="cover-date">Submission Date: April 12, 2026</div>
</div>
<div class="page-break"></div>
<!-- markdownlint-enable MD033 MD041 -->

## Index

1. Executive Summary
2. Report Metadata
3. Part I - Web E2E Testing (Lead: Mahmoud Attia)
4. Part II - Cross E2E Testing (Lead: Youssif Mohamed Abdelfattah)
5. Final Sign-Off and Phase 4 Recommendations

---

<!-- markdownlint-disable MD033 -->
<div class="page-break"></div>
<!-- markdownlint-enable MD033 -->

## Executive Summary

This Phase 3 submission is intentionally split into two independent parts:

- Part I documents Web E2E work completed and validated on the Pulsify and SoundCloud lanes.
- Part II documents Cross Mobile E2E work completed by Youssif Mohamed Abdelfattah, including execution unblockers and triage findings.

The structure avoids mixed consolidation and keeps ownership, scope, and evidence clear for grading.

Key delivery outcomes for this phase:

- Expanded and stabilized web coverage for Modules 1 through 6.
- Refactored benchmark architecture for Modules 4 through 6 into scenario-based TC folders.
- Preserved reproducible evidence trails for module-level and integrated runs.
- Captured cross-mobile execution constraints and workaround-based pass evidence.

---

## Report Metadata

| Field | Detail |
| --- | --- |
| Project | Pulsify (SoundCloud-inspired music platform) |
| Course | CMPS203 - Software Engineering, Spring 2026 |
| Phase | 3 |
| Testing Team Lead | Mahmoud Attia |
| Cross E2E Contributor | Youssif Mohamed Abdelfattah |
| Submission Date | April 12, 2026 |

---

## PART I - Web E2E Testing (Lead: Mahmoud Attia)

### I.1 Scope and Objectives

The Web E2E scope for Phase 3 covered Modules 1 through 6, with goals to:

- improve functional depth beyond smoke-only checks,
- normalize folder architecture and TC traceability,
- keep acceptance evidence reproducible for TA review,
- separate acceptance lane results from benchmark lane results.

### I.2 Test Strategy and Environments

Two complementary lanes were used:

1. Pulsify Acceptance Lane
   - Used for official pass/fail acceptance status.
   - Primary focus for integrated user flows and deployment behavior.

2. SoundCloud Benchmark Lane
   - Used as external benchmark evidence for complete interaction surfaces.
   - Applied specifically where full feature behavior was not yet backend-integrated in Pulsify.

Important justification for full-mark coverage:

- Frontend team confirmed Modules 4 through 6 are currently mock-data implementations and not fully integrated with backend services in Pulsify.
- To validate full upload/playback/engagement behavior and avoid losing coverage marks on integration gaps outside QA control, benchmark validation for Modules 4 through 6 was executed on SoundCloud.
- Pulsify remained the acceptance gate for integrated flows.

### I.3 Delivered Work by Module

Module 1 - Authentication and User Management:

- Re-validated auth scenarios as part of integrated bundle.
- Kept known failing defects explicit and reproducible:
  - branding mismatch in login header,
  - duplicate login links on register page.

Module 2 - User Profile and Social Identity:

- Migrated from broader checks into scenario folders:
  - access
  - profile-card
  - edit-modal
  - save-flow
  - support
- Added stronger validation around constraints, modal handling, and save behavior outcomes.

Module 3 - Followers and Social Graph:

- Migrated into scenario folders:
  - navigation
  - relationship-management
  - network-lists
  - moderation
  - support
- Expanded checks for follow controls, list states, filter/pagination behavior, and moderation actions.

Module 4 - Audio Upload and Track Management (Benchmark Lane):

- Refactored benchmark into visibility, metadata, playback-surface, and support.
- Added explicit checks for track accessibility and stream readiness signals.

Module 5 - Playback and Streaming Engine (Benchmark Lane):

- Refactored benchmark into streaming-controls, accessibility, history-signals, responsive-player, and support.
- Added handled state assertions for playable/auth-gated outcomes.

Module 6 - Engagement and Social Interactions (Benchmark Lane):

- Refactored benchmark into likes-favorites, reposts-share, timestamped-comments, engagement-lists, and support.
- Added checks for social actions, comment/time signals, and engagement list visibility.

### I.4 Web Testing Matrix (Modules 1-6)

| Module | Feature Scope | E2E Spec Location | Current Status | Notes |
| --- | --- | --- | --- | --- |
| Module 1 | Authentication and User Management | e2e/modules/module-01-auth | Active | Latest module-01 segment in integrated run: 27 passed, 2 failed, 1 skipped |
| Module 2 | User Profile and Social Identity | e2e/modules/module-02-profile/(access, profile-card, edit-modal, save-flow, support) | Active | Refactored architecture; latest run: 15 passed |
| Module 3 | Followers and Social Graph | e2e/modules/module-03-social/(navigation, relationship-management, network-lists, moderation, support) | Active | Refactored architecture; latest run: 12 passed |
| Module 4 | Audio Upload and Track Management | e2e/modules/module-04-tracks + e2e/benchmark/soundcloud/module-04-tracks | Active | Benchmark result: 4 passed |
| Module 5 | Playback and Streaming Engine | e2e/modules/module-05-playback + e2e/benchmark/soundcloud/module-05-playback | Active | Benchmark result: 5 passed |
| Module 6 | Engagement and Social Interactions | e2e/modules/module-06-engagement + e2e/benchmark/soundcloud/module-06-engagement | Active | Benchmark result: 4 passed |

### I.5 Final Web Evidence Snapshot

| Coverage Area | Validation Environment | Final Result |
| --- | --- | --- |
| Modules 1-3 Integrated Acceptance | [https://pulsify.page](https://pulsify.page) | 54 passed, 2 failed, 1 skipped |
| Module 2 Refactored Coverage | [https://pulsify.page](https://pulsify.page) | 15 passed |
| Module 3 Refactored Coverage | [https://pulsify.page](https://pulsify.page) | 12 passed |
| Module 4 Benchmark Coverage | [https://soundcloud.com](https://soundcloud.com) | 4 passed |
| Module 5 Benchmark Coverage | [https://soundcloud.com](https://soundcloud.com) | 5 passed |
| Module 6 Benchmark Coverage | [https://soundcloud.com](https://soundcloud.com) | 4 passed |
| Modules 4-6 Pulsify Smoke Sanity | [https://pulsify.page](https://pulsify.page) | 6 passed |

### I.6 Open Web Defects and Risk Impact

Known open Module 1 defects:

- auth header branding mismatch,
- duplicate login link on register page.

Risk impact:

- These are functional/UI quality issues, not random flakiness.
- They do not invalidate module coverage evidence, but they reduce release polish and should be prioritized.

### I.7 Part I Conclusion

Part I successfully delivered broadened, traceable Web E2E coverage across Modules 1 through 6, with clear separation between acceptance and benchmark lanes, and with reproducible evidence suitable for TA evaluation.

---

## PART II - Cross E2E Testing (Lead: Youssif Mohamed Abdelfattah)

### II.1 Scope and Execution Context

Part II covers Cross Mobile E2E work for Modules 1 through 4, executed against Flutter application flows and backend dependencies where required.

Objective:

- produce executable E2E evidence for mobile paths,
- document framework-level blockers clearly,
- keep delivery moving through controlled QA workaround injection where defects prevented native completion.

### II.2 Environment and Tooling Notes

Target surfaces included:

- Cross mobile app runtime (Flutter),
- backend service availability for mobile-connected flows.

Execution included runtime overrides and localized patching only where required to unblock critical compilation or interaction failures.

### II.3 Cross E2E Results Summary

Overall status: Conditionally Passing.

Passing outcomes:

1. Navigation and view-stack transitions across Auth, Config, Feed, and Profile completed successfully.
2. Base UI composition and layout assets were rendered consistently.
3. Configuration path for dynamic API URL injection worked through String.fromEnvironment.

Critical failures requiring triage:

1. Dart 3+ compile failure caused by wildcard overlap in follower/mutual-related component signatures.
2. Missing CAPTCHA structure in registration flow.
3. Keyboard-induced layout shifts obscuring login actions.
4. Persistent overlay shield after genre dropdown interactions in upload flow.
5. Hardcoded delay behavior introducing busy-state driver stalls without override injection.

### II.4 Cross E2E Workload Matrix (Executed Paths)

| Module Targeted | TC Scope Assessed | Workaround Applied | Final Status |
| --- | --- | --- | --- |
| Module 1: Auth and Onboarding | AUTH-001, TC-AUTH-002 | hideKeyboard plus bypass polling for missing CAPTCHA node | Pass |
| Module 2: Profile Customization | PROF-001, TC-PROF-002 | tooltip-based precision selectors to avoid dead zones | Pass |
| Module 3: Social Graph Feed | TC-SOC-001 | bypassed unstable follower view path and validated stable headers | Pass |
| Module 4: Upload Content | TC-UPL-001, TC-UPL-002 | isolated publish-control path and avoided unstable dropdown sequence | Pass |

### II.5 Supporting Backend Observations from Cross Execution

Backend observations recorded during Part II execution:

1. Router/CORS/database coupling paths were operational for baseline runtime.
2. Server startup depended on missing-config behavior that currently crashes instead of graceful fallback when critical env values are absent.
3. Missing seeded E2E account data increased setup fragility.

These are supporting blockers that affect Cross E2E stability and should be addressed to reduce workaround dependency.

### II.6 Part II Conclusion

Part II delivered practical coverage on executable mobile paths and captured high-value defect evidence. The primary quality risk is not missing QA effort; it is the current dependency on temporary workaround patterns caused by unresolved product and integration issues.

---

## Final Sign-Off and Phase 4 Recommendations

### Final Sign-Off

This Phase 3 report is submitted as two distinct QA parts by ownership area:

- Part I: Web E2E (Mahmoud Attia)
- Part II: Cross E2E (Youssif Mohamed Abdelfattah)

Both parts provide validated evidence for covered scope and clearly document blockers outside QA control.

### Phase 4 Priorities

1. Resolve Module 1 web defects and re-run integrated acceptance scope.
2. Remove mobile workaround reliance by fixing compile blockers, CAPTCHA gaps, overlay behavior, and keyboard layout issues.
3. Add backend guardrails for missing env configuration and required E2E seeded users.
4. Expand deeper integrated business-flow checks for Modules 4 through 6 in Pulsify as backend integration lands.
5. Maintain a unified release-readiness dashboard with per-module trend evidence.

---

Phase 3 Testing Report | Testing Team Lead: Mahmoud Attia | Cross E2E Contributor: Youssif Mohamed Abdelfattah | April 12, 2026
