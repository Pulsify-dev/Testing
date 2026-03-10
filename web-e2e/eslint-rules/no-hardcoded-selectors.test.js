'use strict';
/**
 * Unit tests for the no-hardcoded-selectors ESLint rule.
 * Run:  node eslint-rules/no-hardcoded-selectors.test.js
 */

const rule = require('./no-hardcoded-selectors.js');
const { RuleTester } = require('eslint');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

tester.run('no-hardcoded-selectors', rule, {
  valid: [
    // Registry constants — always allowed
    { code: "page.locator(L.module1.loginPage.emailInput)" },
    { code: "page.locator(Auth.loginPage.submitButton)" },
    { code: "page.locator(Playback.playerBar.playPauseButton)" },
    // Semantic Playwright APIs — allowed (not DOM selectors)
    { code: "page.getByText('Sign in')" },
    { code: "page.getByRole('button', { name: 'Submit' })" },
    { code: "page.getByLabel('Email address')" },
    { code: "page.getByPlaceholder('Enter your email')" },
    { code: "page.getByAltText('Logo')" },
    // Navigation strings — allowed
    { code: "page.goto('/login')" },
    { code: "page.waitForURL('/dashboard')" },
    // Variable references — allowed (value determined at runtime)
    { code: "page.locator(mySelector)" },
    { code: "page.locator(selectors.email)" },
  ],

  invalid: [
    // CSS class selector
    {
      code: "page.locator('.login-btn')",
      errors: [{ messageId: 'hardcodedSelector' }],
    },
    // CSS id selector
    {
      code: "page.locator('#email')",
      errors: [{ messageId: 'hardcodedSelector' }],
    },
    // Attribute selector
    {
      code: "page.locator('[data-testid=\"foo\"]')",
      errors: [{ messageId: 'hardcodedSelector' }],
    },
    // HTML tag selector
    {
      code: "page.locator('div')",
      errors: [{ messageId: 'hardcodedSelector' }],
    },
    // Descendant combinator
    {
      code: "page.locator('form input')",
      errors: [{ messageId: 'hardcodedSelector' }],
    },
    // XPath
    {
      code: "page.locator('//button[@type=\"submit\"]')",
      errors: [{ messageId: 'hardcodedSelector' }],
    },
    // $ shorthand
    {
      code: "page.$('.my-class')",
      errors: [{ messageId: 'hardcodedSelector' }],
    },
    // $$ shorthand
    {
      code: "page.$$('ul li')",
      errors: [{ messageId: 'hardcodedSelector' }],
    },
    // Template literal — no expressions
    {
      code: "page.locator(`#hardcoded-id`)",
      errors: [{ messageId: 'hardcodedSelector' }],
    },
    // getByTestId — should come from registry, not a raw string
    {
      code: "page.getByTestId('login-submit-btn')",
      errors: [{ messageId: 'hardcodedTestId' }],
    },
    // waitForSelector
    {
      code: "page.waitForSelector('.spinner')",
      errors: [{ messageId: 'hardcodedSelector' }],
    },
  ],
});

console.log('✓ All no-hardcoded-selectors rule test cases passed.');
