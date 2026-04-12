# Pulsify — Testing Monorepo

End-to-end, mobile integration, and performance stress tests for the **Pulsify** music streaming platform. Three independent testing pillars live side-by-side in this repo:

| Pillar | Tool | Scope |
|---|---|---|
| [`web-e2e/`](#web-e2e) | Playwright + TypeScript | Browser E2E — Module 1 (Auth) · Module 5 (Playback) |
| [`mobile-e2e/`](#mobile-e2e) | Appium + WebdriverIO + TS | Android integration tests |
| [`stress-tests/`](#stress-tests) | K6 | HTTP load, stress, and spike testing |

---

## Repository Structure

```
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
├── mobile-e2e/                     # Appium / WebdriverIO integration suite
│   ├── test/
│   │   ├── specs/                  # Test specifications
│   │   │   ├── module1-auth/       # Auth Appium tests
│   │   │   └── module5-playback/   # Playback Appium tests
│   │   └── locators.ts             # Typed accessor over mobile-locators.json
│   ├── mobile-locators.json        # Single source of truth for element selectors/accessibility IDs
│   ├── wdio.conf.ts                # WebdriverIO configuration
│   ├── tsconfig.json
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
│   ├── results/                    # ← gitignored; generated at runtime
│   └── k6.config.json              # VU stages, thresholds, environments
│
├── .gitignore
└── README.md
```

---

## web-e2e

### Prerequisites

- Node.js ≥ 20
- `npm install` inside `web-e2e/`
- `npx playwright install --with-deps` (installs browser binaries)

### Setup

```bash
cd web-e2e
npm install
npx playwright install --with-deps
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:3000` | Target frontend URL |
| `TEST_USER_EMAIL` | — | E-mail for auth spec login |
| `TEST_USER_PASSWORD` | — | Password for auth spec login |

### Running Tests

```bash
# All tests
npm test

# By module tag
npm run test:auth
npm run test:playback

# UI mode (interactive)
npm run test:ui

# Headed (visible browser)
npm run test:headed
```

### Linting

A custom ESLint rule (`no-hardcoded-selectors`) fails any test that uses hardcoded CSS/XPath/tag selectors instead of importing from the locator registry.

```bash
npm run lint          # check
npm run lint:fix      # auto-fix
npm run lint:rule-tests   # run the rule's own test suite (RuleTester)
```

### Locator Registry

All DOM selectors live in [`web-e2e/web-locators.json`](web-e2e/web-locators.json). Import via:

```ts
import { Auth, Playback } from '../fixtures/locators';

await page.locator(Auth.loginPage.emailInput).fill('user@example.com');
await page.locator(Playback.playerBar.playPauseButton).click();
```

---

## mobile-e2e

### Prerequisites

- Node.js ≥ 20
- Android Studio & Emulator running (with `com.pulsify.app` APK available)
- Appium Server & UiAutomator2 driver (`npm install -g appium`, `appium driver install uiautomator2`)
- `npm install` inside `mobile-e2e/`

### Setup

```bash
cd mobile-e2e
npm install
```

### Running Tests

```bash
# Ensure Appium server is running in a separate terminal:
# appium

# Run all tests
npm test

# Run specific module specs
npx wdio run wdio.conf.ts --suite auth
npx wdio run wdio.conf.ts --suite playback
```

### Locator Registry

All element selectors (Accessibility IDs, XPaths) live in [`mobile-e2e/mobile-locators.json`](mobile-e2e/mobile-locators.json). Import via TypeScript:

```ts
import { Auth } from '../test/locators';

await $(Auth.loginScreen.emailField).setValue('user@example.com');
```

---

## stress-tests

### Prerequisites

- [K6](https://k6.io) ≥ 0.50 — binary at `D:\tools\k6\k6.exe` (added to PATH)

### Configuration

[`stress-tests/k6.config.json`](stress-tests/k6.config.json) defines six stage profiles and three environments:

| Profile | Peak VUs | Duration |
|---|---|---|
| `smoke` | 2 | ~1m 40s |
| `load` | 50 | ~4m 30s |
| `stress` | **500** | ~5m |
| `spike` | 1 000 | ~1m 20s |
| `soak` | 100 | ~4h 4m |
| `breakpoint` | 1 200 | ~14m |

| Environment | Base URL |
|---|---|
| `local` | `http://localhost:4000` |
| `staging` | `https://api.staging.pulsify.dev` |
| `production` | `https://api.pulsify.dev` |

### Running Tests

```bash
cd stress-tests

# Combined run (both /api/login + /api/search, concurrent)
k6 run --env STAGE=smoke  --env ENV=local    scenarios/run-all.js
k6 run --env STAGE=stress --env ENV=staging  scenarios/run-all.js

# Individual scenarios
k6 run --env STAGE=stress --env ENV=staging  scenarios/login.stress.js
k6 run --env STAGE=stress --env ENV=staging  scenarios/search.stress.js

# npm convenience scripts (from package.json)
npm run test:smoke
npm run test:load
npm run test:stress
npm run test:spike
npm run test:soak
```

### Environment Secrets (K6)

| Variable | Description |
|---|---|
| `K6_CAPTCHA_BYPASS_TOKEN` | Server-side captcha bypass token for load testing |
| `BASE_URL` | Override base URL at runtime |

Pass via `--env` flag: `k6 run --env K6_CAPTCHA_BYPASS_TOKEN=xxx ...`

### Thresholds

Global (both endpoints):
- `http_req_duration` p95 < 1 500 ms · p99 < 3 000 ms
- `http_req_failed` rate < 1 %

Per-endpoint:
- `/api/login`: p95 < 800 ms · p99 < 2 000 ms · error rate < 0.5 %
- `/api/search`: p95 < 1 200 ms · p99 < 2 500 ms · error rate < 1 %

---

## Test Coverage Matrix

| Module | Web E2E | Mobile | Stress |
|---|:---:|:---:|:---:|
| Module 1 — Auth (Login / Register / Forgot / Reset) | ✅ | ✅ | ✅ `/api/login` |
| Module 5 — Playback (Player · Queue · Fullscreen) | ✅ | ✅ | ✅ `/api/search` |

---

## Contributing

1. **Selectors/keys** — never hardcode. Add to `web-locators.json` or `mobile-locators.json` first.
2. **Web tests** — must pass `npm run lint` before merge. The `no-hardcoded-selectors` rule is enforced in CI.
3. **K6 scenarios** — new endpoints get a new file in `scenarios/` and payload factory in `lib/payloads.js`.
4. **Tags** — web specs use `@tag` annotations; mobile tests use WebdriverIO suites or `@tag` mocha grep strings.
