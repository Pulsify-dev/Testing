import { defineConfig, devices } from '@playwright/test';

/**
 * Pulsify Web E2E — Playwright Configuration
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /* Root directory for all test files */
  testDir: './tests',

  /* Glob patterns for test files */
  testMatch: '**/*.spec.ts',

  /* Max time one test can run (30 s) */
  timeout: 30_000,

  /* Max time the whole test suite can run */
  globalTimeout: 10 * 60_000,

  /* Fail the build on first test-file failure in CI */
  bail: process.env.CI ? 1 : 0,

  /* Run tests in parallel */
  fullyParallel: true,

  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  /* Shared settings for every test */
  use: {
    /* Base URL so tests can use relative paths: await page.goto('/login') */
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',

    /* Capture a screenshot on failure */
    screenshot: 'only-on-failure',

    /* Collect a trace on failure for debugging */
    trace: 'retain-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Browser locale / timezone */
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  /* Test projects — run against multiple browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Mobile viewports */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  /* Folder for test artifacts (screenshots, videos, traces) */
  outputDir: 'test-results',

  /* Start the dev server automatically (optional — comment out if not needed) */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120_000,
  // },
});
