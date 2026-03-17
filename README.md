# Pulsify — Testing Monorepo

End-to-end, mobile integration, and performance stress tests for the **Pulsify** music streaming platform. This repository follows a unified architecture, ensuring that web and mobile testing suites share the same logic, linting rules, and locator patterns.

---

## 🏗️ Repository Architecture

| Pillar | Tool | Scope |
| :--- | :--- | :--- |
| **web-e2e/** | Playwright + TypeScript | Browser E2E — Module 1 (Auth) · Module 5 (Playback) |
| **mobile-e2e/** | Appium + WebdriverIO | Android / iOS integration tests (Unified TS Structure) |
| **stress-tests/** | K6 | HTTP load, stress, and spike testing |

---

## 📂 Repository Structure

```text
Testing/
├── web-e2e/                        # Playwright web E2E suite
│   ├── eslint-rules/               # Custom ESLint rule: no-hardcoded-selectors
│   ├── fixtures/
│   │   └── locators.ts             # Typed accessor over web-locators.json
│   ├── tests/
│   │   ├── module1-auth/           # Auth specs (@auth tag)
│   │   └── module5-playback/       # Playback specs (@playback tag)
│   ├── web-locators.json           # Single source of truth for DOM selectors
│   ├── playwright.config.ts
│   ├── .eslintrc.js
│   └── package.json
│
├── mobile-e2e/                     # Appium + WDIO mobile suite
│   ├── eslint-rules/               # Custom ESLint rule: no-hardcoded-selectors
│   ├── fixtures/
│   │   └── locators.ts             # Typed accessor over mobile-locators.json
│   ├── tests/
│   │   ├── module1-auth/           # Auth specs (@auth tag)
│   │   └── module5-playback/       # Playback specs (@playback tag)
│   ├── mobile-locators.json        # Single source of truth for Accessibility IDs/Keys
│   ├── wdio.conf.ts                # WebdriverIO / Appium configuration
│   ├── .eslintrc.js
│   └── package.json
│
├── stress-tests/                   # K6 performance / stress test suite
│   ├── lib/
│   │   ├── helpers.js              # Shared utilities, custom metrics, auth
│   │   └── payloads.js             # HTTP payload factory functions
│   ├── scenarios/
│   │   ├── login.stress.js         # /api/login standalone scenario
│   │   ├── search.stress.js        # /api/search standalone scenario
│   │   └── run-all.js              # Combined multi-scenario runner
│   └── k6.config.json              # VU stages, thresholds, environments
│
└── README.md
