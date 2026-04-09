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
    - empty-form-submit-disabled.spec.js
    - short-password-blocked.spec.js
    - terms-required.spec.js
    - captcha-visible.spec.js
    - sign-in-navigation.spec.js
    - login-link-uniqueness.spec.js
    - username-min-length-edge.spec.js
  - recovery/
    - empty-email-submit-disabled.spec.js
    - invalid-email-rejected.spec.js
    - valid-email-success-state.spec.js
    - back-to-login-navigation.spec.js
  - social/
    - provider-visible.spec.js
    - provider-buttons-type.spec.js
    - register-social-visible.spec.js
  - verification/
    - verified-query-loads-login.spec.js
    - invalid-token-query-loads-login.spec.js
    - missing-token-query-loads-login.spec.js
    - live-registration-check-email.spec.js
  - tokens/
    - no-token-before-login.spec.js
    - token-stored-after-login.spec.js
    - token-shape-jwt.spec.js
  - support/
    - module1-auth.helper.js
- modules/module-02-profile
  - profile.spec.js
- modules/module-03-social
  - social.smoke.spec.js (scaffold)
- modules/module-04-tracks
  - tracks.smoke.spec.js (scaffold)
- modules/module-05-playback
  - playback.smoke.spec.js (scaffold)
- modules/module-06-engagement
  - engagement.smoke.spec.js (scaffold)
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
- npm run test:e2e:m1-m6

Manual GUI walkthrough for TA demos:

- docs/How_To_Run_Playwright_GUI.md

## Blackbox Principles Used

- Tests assert observable behavior only (navigation, visible content, form validity, access control).
- No backend internals are asserted from E2E specs.
- Shared selectors and helpers are centralized under support for maintainability.
