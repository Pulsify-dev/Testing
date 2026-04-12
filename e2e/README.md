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
  - profile.spec.js
- modules/module-03-social
  - social.smoke.spec.js
- modules/module-04-tracks
  - tracks.smoke.spec.js
- modules/module-05-playback
  - playback.smoke.spec.js
- modules/module-06-engagement
  - engagement.smoke.spec.js
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

Manual GUI walkthrough for TA demos:

- docs/How_To_Run_Playwright_GUI.md

Module 4 to 6 note:

- Track-page smoke specs are environment-aware. They validate full track UI when available, or the deployed fallback state (`Track unavailable right now.`) when those flows are not yet fully integrated in the target environment.

Environment strategy note:

- Use Pulsify deployment as the pass/fail gate for modules 1 to 6.
- SoundCloud can be used as external benchmarking reference only, not as acceptance criteria for Pulsify modules.

## Blackbox Principles Used

- Tests assert observable behavior only (navigation, visible content, form validity, access control).
- No backend internals are asserted from E2E specs.
- Shared selectors and helpers are centralized under support for maintainability.
