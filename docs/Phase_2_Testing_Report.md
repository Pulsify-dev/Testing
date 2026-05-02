# Phase 2 Testing Report — Pulsify

| Field | Detail |
|---|---|
| **Project** | Pulsify (SoundCloud Clone) |
| **Course** | CMPS203 — Software Engineering, Spring 2026 |
| **Testing Team Leader** | Mahmoud Attia |
| **Phase** | 2 |
| **Report Date** | March 24, 2026 |

---

## Part A — Backend Testing (Module 1: Authentication)

**Methodology:** Manual contract testing against the OpenAPI spec (`Pulsify_API.TXT`) using an API client.

### A.1 Passed Endpoints

| Endpoint | Description | Result |
|---|---|---|
| `POST /api/v1/auth/register` | Register user with mock CAPTCHA | ✅ Pass |
| `POST /api/v1/auth/verify-email` | Verify email; `is_verified` confirmed | ✅ Pass |
| `POST /api/v1/auth/forgot-password` | Trigger reset token via mock email | ✅ Pass |
| `POST /api/v1/auth/reset-password` | Update credentials via reset token | ✅ Pass |
| `POST /api/v1/auth/login` | Returns JWT Access + Refresh tokens | ✅ Pass |
| `POST /api/v1/auth/refresh` | Issues new tokens upon expiry | ✅ Pass |

### A.2 Bugs Found & GitHub Issues Filed (All Closed ✅)

| Issue | Title | Severity | Status |
|---|---|---|---|
| #20 | [BUG-BE-001] Base URL Mismatch: OpenAPI Spec vs. Implementation | High | ✅ Closed |
| #21 | [BUG-BE-002] Missing Auth Endpoints: Logout & Change Password | High | ✅ Closed |
| #22 | [BUG-BE-003] Auth Middleware: Empty input returns 401 instead of 400 | Low | ✅ Closed |
| #23 | [TASK-BE-001] Backend Console: Mongoose Deprecation Warnings | Low | ✅ Closed |

> All 4 bugs filed by the Testing Team Lead were resolved and closed by the backend team within Phase 2.

### A.3 Deferred Features

| Feature | Status |
|---|---|
| Social Identity / Google Login | ⏸️ Deferred to Phase 3 |
| OAuth 2.0 Flow | ⏸️ Deferred to Phase 3 |

---

## Part B — Backend Testing (Module 2: User Profile)

**Contributor:** Backend QA Team Member
**Methodology:** Isolated API Integration Testing using Jest/Mocha + Supertest + MongoDB Memory Server.

### B.1 Tooling Stack

| Tool | Role |
|---|---|
| **Jest / Mocha** | Test runner |
| **Supertest** | Virtual HTTP client — hits `Express.app` directly, no port needed |
| **MongoDB Memory Server** | Isolated in-memory DB — no pollution of dev data |
| **Mock JWT** | Auth simulated by programmatically signing tokens for dummy users |

### B.2 Test Results — 🟢 100% PASSING

| Endpoint | Scenario | Expected | Result |
|---|---|---|---|
| `GET /api/users/me` | Retrieve profile with mock JWT | HTTP 200, body has `name` + `email` | ✅ Pass |
| `PATCH /api/users/me` | Update `bio` field | HTTP 200, DB confirms save | ✅ Pass |
| `DELETE /api/users/me` | Wrong password provided | HTTP 403 Forbidden | ✅ Pass |
| `DELETE /api/users/me` | Valid credentials | HTTP 200 OK | ✅ Pass |
| `PATCH /api/users/me` | Invalid JSON body | HTTP 400 Bad Request | ✅ Pass |
| `DELETE /api/users/me` | No password provided | HTTP 401 Unauthorized | ✅ Pass |

### B.3 CI/CD Setup

- `npm run test:api` added to `Backend/package.json`
- Runs on every GitHub push — all 9 profile endpoints validated in **2–3 seconds**

### B.4 Pending Client-Side Action Items

**Module 2:** TextField for Location · Genre multi-select · Account Tier dropdown · Social URL fields · Privacy toggle

**Module 1:** `P0` Sign Out button · `P1` CAPTCHA on registration form

---

## Part C — Backend Testing (Module 3: Followers & Social Graph)

**Methodology:** Manual contract testing against the OpenAPI specification.

### C.1 Test Results — 🔴 ALL TESTS FAILED

| Endpoint | Expected | Result | Reason |
|---|---|---|---|
| `POST /api/v1/users/:id/follow` | 200 OK | ❌ 404 | Route disabled |
| `DELETE /api/v1/users/:id/follow` | 200 OK | ❌ 404 | Route disabled |
| `GET /api/v1/users/:id/followers` | 200 + list | ❌ 404 | Route disabled |
| `GET /api/v1/users/:id/following` | 200 + list | ❌ 404 | Route disabled |
| `GET /api/v1/users/suggestions` | 200 + list | ❌ 404 | Route disabled |
| `GET /api/v1/users/:id/mutual-followers` | 200 + list | ❌ 404 | Route disabled |
| `POST /api/v1/users/:id/block` | 200 OK | ❌ 404 | Route disabled |
| `DELETE /api/v1/users/:id/block` | 200 OK | ❌ 404 | Route disabled |
| `GET /api/v1/users/me/blocked` | 200 + list | ❌ 404 | Route disabled |
| `GET /api/v1/users/:id/social-counts` | 200 + counts | ❌ 404 | Route disabled |

### C.2 Root Cause

The entire `social.routes.js` file is **fully commented out** in the codebase. The `social.controller.js` logic exists but is unreachable at the HTTP level. GitHub Issue `#24` was filed and closed — re-enablement is pending Phase 3.

---

## Part D — Frontend Black-Box E2E Testing (Module 1: Authentication)

**Framework:** Playwright | **Base URL:** `http://localhost:5173`
**Rule:** All selectors centralized in `e2e/selectors.js` (Project Rule 10)

### D.1 Login (`/login`) — `auth.spec.js`

| Test ID | Scenario | Result |
|---|---|---|
| TC-AUTH-01 | Button disabled when email is empty | ✅ Pass |
| TC-AUTH-02 | Invalid email format → error shown | ✅ Pass |
| TC-AUTH-03 | Valid email → redirects away from `/login` | ❌ Expected Failure (Bug) |
| TC-AUTH-04 | Page shows "Pulsify" not "SoundCloud" | ❌ Expected Failure (Bug) |
| TC-AUTH-05 | "Create account" link → `/register` | ✅ Pass |

### D.2 Registration (`/register`) — `register.spec.js`

| Test ID | Scenario | Result |
|---|---|---|
| TC-REG-01 | All fields empty → error | ✅ Pass |
| TC-REG-02 | Password < 6 chars → error | ✅ Pass |
| TC-REG-03 | Passwords mismatch → error | ✅ Pass |
| TC-REG-04 | Terms unchecked → blocked | ✅ Pass |
| TC-REG-05 | Valid form → redirects away | ❌ Expected Failure (Bug) |
| TC-REG-06 | "Sign in" link → `/login` | ❌ Expected Failure (Bug) |

### D.3 Password Recovery (`/forgot-password`) — `recovery.spec.js`

| Test ID | Scenario | Result |
|---|---|---|
| TC-REC-01 | Button disabled when email is empty | ✅ Pass |
| TC-REC-02 | Invalid email → error | ✅ Pass |
| TC-REC-03 | Valid email → success message | ✅ Pass |
| TC-REC-04 | "Sign in" link → `/login` | ❌ Expected Failure (Bug) |

---

## Part E — Frontend Black-Box E2E Testing (Module 2: User Profile)

### E.1 Profile Page (`/profile`) — `profile.spec.js` — 🟢 13/13 Passing

| Test ID | Scenario | Result |
|---|---|---|
| TC-PROF-01 | Profile page loads and shows profile card | ✅ Pass |
| TC-PROF-02 | Card shows name, account tier, privacy status | ✅ Pass |
| TC-PROF-03 | Edit form contains all required fields | ✅ Pass |
| TC-PROF-04 | Update display name → card reflects change | ✅ Pass |
| TC-PROF-05 | Bio enforces 500 char max | ✅ Pass |
| TC-PROF-06 | Update location → saves without error | ✅ Pass |
| TC-PROF-07 | Genres saved as tags | ✅ Pass |
| TC-PROF-08 | Switch to Private → card shows "Private" | ✅ Pass |
| TC-PROF-09 | Switch to Public → card shows "Public" | ✅ Pass |
| TC-PROF-10 | Instagram link saved → appears in card | ✅ Pass |
| TC-PROF-11 | Non-URL in social field → form rejected | ✅ Pass |
| TC-PROF-12 | Avatar upload accepts images only | ✅ Pass |
| TC-PROF-13 | Cover upload accepts images only | ✅ Pass |

---

## Part F — Frontend Bug Reports (All Open 🔴)

| Issue | Title | Severity | Status |
|---|---|---|---|
| #9 | [UI/UX] Login page displays "SoundCloud" instead of "Pulsify" | Medium | 🔴 Open |
| #10 | [Functional/Security] Login flow does not require or validate user password | Critical | 🔴 Open |
| #11 | [Accessibility/Testing] Email input field is missing standard `name` attribute | Low | 🔴 Open |
| #12 | [Testing/Architecture] Missing `data-testid` attributes on critical UI elements | Medium | 🔴 Open |
| #13 | [Testing/Functional] Custom email error message unreachable due to native HTML validation | Medium | 🔴 Open |
| #14 | [Feature Missing/Security] Registration page is missing the required CAPTCHA | Critical | 🔴 Open |
| #15 | [Functional] Login "Continue" button does not navigate after successful email entry | High | 🔴 Open |
| #16 | [UI/Accessibility/Testing] Forgot Password page has two identical "Sign in" links | Critical | 🔴 Open |
| #17 | [Functional] Registration form submits but does not redirect away from `/register` | High | 🔴 Open |
| #18 | [UI/Accessibility/Testing] Register page has multiple identical "Sign in" links | Medium | 🔴 Open |


---

## Part G — Coverage Summary

### Backend

| Module | Endpoints Tested | ✅ Pass | ❌ Fail |
|---|---|---|---|
| Module 1 — Auth | 6 | 6 | 0 |
| Module 2 — Profile | 6 | 6 | 0 |
| Module 3 — Social | 10 | 0 | 10 |
| **Total** | **22** | **12** | **10** |

### Frontend E2E

| Module | Tests | ✅ Pass | ❌ Expected Failure |
|---|---|---|---|
| Module 1 — Auth | 15 | 10 | 5 |
| Module 2 — Profile | 13 | 13 | 0 |
| **Total** | **28** | **23** | **5** |

---

## Part H — Conclusion

- **Backend Module 1** — All happy-path flows pass. All 4 bugs filed were resolved and closed by the backend team.
- **Backend Module 2** — 100% passing. CI/CD pipeline in place. Backend fully production-ready for this module.
- **Backend Module 3** — Entirely non-functional. Routes disabled. Must be re-enabled in Phase 3.
- **Frontend Module 1** — 5 known bugs tracked with `test.fail()`. 10 tests passing.
- **Frontend Module 2** — Clean. 13/13 tests pass. No bugs found.
- **Remaining:** Modules 5 (Playback), 7 (Playlists), 8 (Feed) frontend testing pending.

---
*Phase 2 Testing Report | Testing Team Leader: Mahmoud Attia | March 24, 2026*
