
# Pulsify — Testing Monorepo

End-to-end, mobile integration, and performance stress tests for the **Pulsify** music streaming platform. Three independent testing pillars live side-by-side in this repo:

| Pillar | Tool | Scope |
| :--- | :--- | :--- |
| [`web-e2e/`](#web-e2e) | Playwright + TypeScript | Browser E2E — Module 1 (Auth) · Module 5 (Playback) |
| [`mobile-e2e/`](#mobile-e2e) | Appium + WebdriverIO + TS | Android / iOS integration tests |
| [`stress-tests/`](#stress-tests) | K6 | HTTP load, stress, and spike testing |

---## Repository Structure```text
Testing/
├── web-e2e/                # Playwright web E2E suite
│   ├── eslint-rules/       # Custom ESLint rule: no-hardcoded-selectors
│   ├── fixtures/
│   │   └── locators.ts     # Typed accessor over web-locators.json
│   ├── tests/
│   │   ├── module1-auth/   # Auth specs (@auth tag)
│   │   └── module5-playback/ # Playback specs (@playback tag)
│   ├── web-locators.json   # Single source of truth for DOM selectors
│   ├── playwright.config.ts
│   ├── .eslintrc.js
│   └── package.json
│
├── mobile-e2e/             # Appium + WebdriverIO mobile suite
│   ├── eslint-rules/       # Custom ESLint rule: no-hardcoded-selectors
│   ├── fixtures/
│   │   └── locators.ts     # Typed accessor over mobile-locators.json
│   ├── tests/
│   │   ├── module1-auth/   # Auth specs (@auth tag)
│   │   └── module5-playback/ # Playback specs (@playback tag)
│   ├── mobile-locators.json # Single source of truth for Accessibility IDs/Keys
│   ├── wdio.conf.ts        # Appium/WDIO configuration
│   ├── .eslintrc.js
│   └── package.json
│
├── stress-tests/           # K6 performance / stress test suite
│   ├── lib/
│   │   ├── helpers.js      # Shared utilities, custom metrics, auth
│   │   └── payloads.js     # HTTP payload factory functions
│   ├── scenarios/
│   │   ├── login.stress.js # /api/login standalone scenario
│   │   ├── search.stress.js # /api/search standalone scenario
│   │   └── run-all.js      # Combined multi-scenario runner
│   ├── results/            # ← gitignored; generated at runtime
│   └── k6.config.json      # VU stages, thresholds, environments
│
├── .gitignore
└── README.md
## web-e2e
Prerequisites
Node.js ≥ 20
npm install inside web-e2e/
npx playwright install --with-deps (installs browser binaries)
Setup & Environment
Bash

cd web-e2e
npm install
npx playwright install --with-deps
VariableDefaultDescriptionBASE_URLhttp://localhost:3000Target frontend URLTEST_USER_EMAIL—E-mail for auth spec loginTEST_USER_PASSWORD—Password for auth spec login
Running Tests
Bash

# All tests
npm test# By module tag
npm run test:auth
npm run test:playback# UI mode (interactive)
npm run test:ui# Headed (visible browser)
npm run test:headed
Locator Registry & Linting
A custom ESLint rule (no-hardcoded-selectors) fails any test that uses hardcoded CSS/XPath/tag selectors. All DOM selectors must live in web-e2e/web-locators.json.
TypeScript

import { Auth, Playback } from '../fixtures/locators';// Usage example:await page.locator(Auth.loginPage.emailInput).fill('user@example.com');await page.locator(Playback.playerBar.playPauseButton).click();
## mobile-e2e
Prerequisites
Node.js ≥ 20
Appium Server: npm install -g appium
Drivers: uiautomator2 (Android) / xcuitest (iOS)
Appium Inspector for element discovery
Running Tests
Bash

cd mobile-e2e
npm install# All tests
npm test# Specific capabilities (defined in wdio.conf.ts)
npm run test:android
npm run test:ios# By module tag (via grep)
npm run test:auth
Locator Registry
All mobile widget identifiers live in mobile-e2e/mobile-locators.json.
TypeScript

import { Auth } from '../fixtures/locators';await $(Auth.loginScreen.emailField).setValue('user@example.com');
## stress-tests
Prerequisites
K6 ≥ 0.50 — binary at D:\tools\k6\k6.exe (added to PATH).
Configuration
stress-tests/k6.config.json defines six stage profiles and three environments:
ProfilePeak VUsDurationsmoke2~1m 40sload50~4m 30sstress500~5mspike1,000~1m 20ssoak100~4h 4mbreakpoint1,200~14m
Running Tests
Bash

cd stress-tests# Combined run (both /api/login + /api/search, concurrent)
k6 run --env STAGE=smoke --env ENV=local scenarios/run-all.js# Individual scenarios
k6 run --env STAGE=stress --env ENV=staging scenarios/login.stress.js# npm convenience scripts
npm run test:smoke
npm run test:stress
## Test Coverage Matrix
ModuleWeb E2EMobileStressModule 1 — Auth✅✅✅ (/api/login)Module 5 — Playback✅✅✅ (/api/search)## Contributing
Selectors/keys: Never hardcode. Add to web-locators.json or mobile-locators.json first.
Linting: All tests must pass npm run lint. The no-hardcoded-selectors rule is strictly enforced.
K6 Scenarios: New endpoints get a new file in scenarios/ and payload factory in lib/payloads.js.
Tags: Use @tag annotations in test descriptions for filtered execution.

