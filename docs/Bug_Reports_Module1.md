# Bug Reports: Authentication (Module 1)

*Please copy and paste these into your GitHub Issues tab.*

---

## Issue 1: [UI/UX] Login Page displays "SoundCloud" instead of "Pulsify"

**Description:**
The login page text incorrectly references the original platform "SoundCloud" rather than the project brand name "Pulsify" in the terms of use subtext.

**Steps to Reproduce:**
1. Navigate to `/login`
2. Look at the subtitle text beneath "Sign in or create an account"

**Expected Behavior:**
The text should read: "...you agree to Pulsify's Terms of Use..."

**Actual Behavior:**
The text currently reads: "...you agree to SoundCloud's Terms of Use..."

**Priority:** Medium (Branding Issue)
**Labels:** `bug`, `frontend`, `UI`

---

## Issue 2: [Functional/Security] Login flow does not require or validate user password

**Description:**
The current `Login.jsx` component completely omits the password field for traditional email logins. Users can seemingly authenticate using only an email address without providing a password.

**Steps to Reproduce:**
1. Navigate to `/login`
2. Enter a valid email address
3. Observe that there is no password input field.
4. Click "Continue"
5. The system performs `mockLogin(nextEmail)` and logs the user in.

**Expected Behavior:**
Standard authentication requires a password input field, and the submission should validate both the email and the password against the mock database (or backend).

**Actual Behavior:**
Authentication succeeds with only an email address.

**Priority:** High / Critical (Security/Core Functionality)
**Labels:** `bug`, `frontend`, `authentication`

---

## Issue 3: [Accessibility/Testing] Email input field is missing standard 'name' attribute

**Description:**
The email input field on the login page lacks a `name` attribute. While it has `type="email"`, the standard HTML practice for forms dictates that every input should have a corresponding `name` attribute. This also breaks standard automated testing localization queries.

**Steps to Reproduce:**
1. Navigate to `/login`
2. Inspect the email input element.

**Expected Behavior:**
`<input type="email" name="email" ... />`

**Actual Behavior:**
`<input type="email" placeholder="..." className="auth-input" ... />` (Missing `name="email"`)

**Priority:** Low (Technical Debt / Quality)
**Labels:** `bug`, `frontend`, `accessibility`
