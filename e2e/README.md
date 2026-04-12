# E2E Test Suite (Module-Oriented)

This E2E suite is organized by project module to keep ownership, traceability, and reporting clear.

## Folder Structure

- modules/module-01-auth
  - login/
    - TC01-empty-email-disabled.spec.js
    - TC02-invalid-email-rejected.spec.js
    - TC03-password-required.spec.js
    - TC04-pulsify-branding.spec.js
    - TC05-create-account-navigation.spec.js
    - TC06-forgot-password-navigation.spec.js
    - TC07-invalid-credentials-error.spec.js
    - TC08-successful-login-stores-tokens.spec.js
    - TC09-authenticated-user-redirected.spec.js
  - register/
    - TC01-empty-form-submit-disabled.spec.js
    - TC02-short-password-blocked.spec.js
    - TC03-terms-required.spec.js
    - TC04-captcha-visible.spec.js
    - TC05-sign-in-navigation.spec.js
    - TC06-login-link-uniqueness.spec.js
    - TC07-username-min-length-edge.spec.js
  - recovery/
    - TC01-empty-email-submit-disabled.spec.js
    - TC02-invalid-email-rejected.spec.js
    - TC03-valid-email-success-state.spec.js
    - TC04-back-to-login-navigation.spec.js
  - social/
    - TC01-provider-visible.spec.js
    - TC02-provider-buttons-type.spec.js
    - TC03-register-social-visible.spec.js
  - verification/
    - TC01-verified-query-loads-login.spec.js
    - TC02-invalid-token-query-loads-login.spec.js
    - TC03-missing-token-query-loads-login.spec.js
    - TC04-live-registration-check-email.spec.js
  - tokens/
    - TC01-no-token-before-login.spec.js
    - TC02-token-stored-after-login.spec.js
    - TC03-token-shape-jwt.spec.js
  - support/
    - module1-auth.helper.js
- modules/module-02-profile
  - access/
    - TC01-profile-route-protected.spec.js
  - profile-card/
    - TC01-profile-card-renders.spec.js
    - TC02-identity-and-counters-visible.spec.js
  - edit-modal/
    - TC01-edit-modal-fields-visible.spec.js
    - TC02-avatar-input-accepts-images.spec.js
    - TC03-cover-input-accepts-images.spec.js
    - TC04-cancel-keeps-display-name.spec.js
    - TC05-profile-url-readonly.spec.js
    - TC06-add-link-exposes-inputs.spec.js
    - TC07-display-name-required.spec.js
    - TC08-bio-maxlength-500.spec.js
  - save-flow/
    - TC01-save-unchanged-fields-handled.spec.js
    - TC02-display-name-bio-persist-or-error.spec.js
    - TC03-location-persist-or-error.spec.js
    - TC04-invalid-display-name-server-rejection.spec.js
  - support/
    - module2-profile.helper.js
- modules/module-03-social
  - navigation/
    - TC01-social-tabs-and-route-headings.spec.js
  - relationship-management/
    - TC01-follow-controls-or-handled.spec.js
    - TC02-follow-toggle-valid-state.spec.js
  - network-lists/
    - TC01-following-view-handled-state.spec.js
    - TC02-followers-view-handled-state.spec.js
    - TC03-suggested-users-panel.spec.js
    - TC04-filter-no-match-handled.spec.js
    - TC05-pagination-controls-handled.spec.js
  - moderation/
    - TC01-block-modal-open-cancel.spec.js
    - TC02-blocked-users-view-handled-state.spec.js
    - TC03-edit-block-reason-modal.spec.js
    - TC04-unblock-action-handled.spec.js
  - support/
    - module3-social.helper.js
- modules/module-04-tracks
  - tracks.smoke.spec.js
- modules/module-05-playback
  - playback.smoke.spec.js
- modules/module-06-engagement
  - engagement.smoke.spec.js
- benchmark/soundcloud
  - module-04-tracks
    - visibility/TC01-public-track-accessible.spec.js
    - metadata/TC01-track-metadata-signals.spec.js
    - playback-surface/TC01-waveform-or-seekbar-visible.spec.js
    - playback-surface/TC02-track-stream-readiness.spec.js
    - support/module4-soundcloud.helper.js
  - module-05-playback
    - streaming-controls/TC01-core-playback-controls-visible.spec.js
    - streaming-controls/TC02-play-action-yields-playback-state.spec.js
    - accessibility/TC01-playback-accessibility-handled.spec.js
    - history-signals/TC01-playback-history-signals.spec.js
    - responsive-player/TC01-sticky-player-visible-after-scroll.spec.js
    - support/module5-soundcloud.helper.js
  - module-06-engagement
    - likes-favorites/TC01-like-actions-and-count-signals.spec.js
    - reposts-share/TC01-repost-and-share-signals.spec.js
    - timestamped-comments/TC01-comment-and-timestamp-signals.spec.js
    - engagement-lists/TC01-likes-and-reposts-list-signals.spec.js
    - support/module6-soundcloud.helper.js
  - support/soundcloud.helper.js
- support
  - selectors.js
  - helpers/auth.helper.js

## Execution

Set deployment URL and credentials when needed:

- BASE_URL: [https://pulsify.page](https://pulsify.page)
- TEST_USER_EMAIL: your authenticated test account email
- TEST_USER_PASSWORD: your authenticated test account password

Run examples:

- npm run test:e2e
- npm run test:e2e:m1
- npm run test:e2e:m2
- npm run test:e2e:m1-m3:chromium
- npm run test:e2e:m4-m6:chromium
- npm run test:e2e:m1-m6
- npm run test:e2e:sc:m4-m6
- npm run test:e2e:sc:m4-m6:headed

Manual GUI walkthrough for TA demos:

- docs/How_To_Run_Playwright_GUI.md

Module 4 to 6 note:

- Track-page smoke specs are environment-aware. They validate full track UI when available, or the deployed fallback state (`Track unavailable right now.`) when those flows are not yet fully integrated in the target environment.

Environment strategy note:

- Use Pulsify deployment as the pass/fail gate for modules 1 to 6.
- SoundCloud can be used as external benchmarking reference only, not as acceptance criteria for Pulsify modules.
- SoundCloud benchmark specs are isolated under e2e/benchmark/soundcloud to avoid mixing external results with Pulsify acceptance reports.

## Blackbox Principles Used

- Tests assert observable behavior only (navigation, visible content, form validity, access control).
- No backend internals are asserted from E2E specs.
- Shared selectors and helpers are centralized under support for maintainability.
