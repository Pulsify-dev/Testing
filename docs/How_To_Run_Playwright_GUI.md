# How To Run Playwright GUI (Manual)

This guide is for running tests manually and discussing results with your TA.

## 1) What was confusing before

If you run Playwright from the wrong folder, `npx` may try to install another Playwright version or fail.

Correct folder is:

- `D:/CCEE/spring 26/CMPS203 - Software Engineering/Project/pulsify/Testing`

## 2) Easiest way (recommended)

Use the launcher script (works even if your terminal starts in another folder):

```powershell
powershell -ExecutionPolicy Bypass -File "D:/CCEE/spring 26/CMPS203 - Software Engineering/Project/pulsify/Testing/scripts/playwright-ui.ps1"
```

Run only Module 1 in GUI:

```powershell
powershell -ExecutionPolicy Bypass -File "D:/CCEE/spring 26/CMPS203 - Software Engineering/Project/pulsify/Testing/scripts/playwright-ui.ps1" -Scope module1
```

## 3) NPM commands (when already inside Testing folder)

```powershell
Set-Location "D:/CCEE/spring 26/CMPS203 - Software Engineering/Project/pulsify/Testing"
npm run gui
```

Module 1 only:

```powershell
npm run gui:m1
```

## 4) What BASE_URL means

`BASE_URL` is the website your tests open.

For this project it should be:

- [https://pulsify.page](https://pulsify.page)

If you do not set anything, the current config and launcher default to [https://pulsify.page](https://pulsify.page).

## 5) Optional credentials for auth-required tests

Some tests are skipped unless credentials exist.

```powershell
$env:TEST_USER_EMAIL="your_test_email"
$env:TEST_USER_PASSWORD="your_test_password"
npm run gui:m1
```

## 6) In Playwright GUI

1. Select a file from the left panel.
2. Click a single test to run only that test.
3. Use "Run all" for full module execution.
4. Open trace/video/screenshot for failures.
