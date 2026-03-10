/**
 * ESLint Configuration — Pulsify Web E2E
 *
 * Enforces:
 *   1. TypeScript best practices via @typescript-eslint
 *   2. Playwright-specific selector safety via the local no-hardcoded-selectors rule
 */

'use strict';

const path = require('path');

/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,

    parser: '@typescript-eslint/parser',

    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: path.resolve(__dirname, 'tsconfig.json'),
        tsconfigRootDir: __dirname,
    },

    plugins: [
        '@typescript-eslint',
        // Local rules are loaded via --rulesdir eslint-rules (see npm scripts).
        // No plugin registration needed here.
    ],

    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],

    // Rules in ./eslint-rules/ are loaded via the CLI flag --rulesdir eslint-rules
    // (defined in the "lint" and "lint:fix" npm scripts in package.json).
    // To run ad-hoc:  npx eslint --rulesdir eslint-rules "tests/**/*.ts"

    env: {
        node: true,
        es2022: true,
    },

    rules: {
        // ── Selector safety (custom rule) ────────────────────────────────────────
        'no-hardcoded-selectors': [
            'error',
            {
                // Additional project-specific wrapper methods that accept a selector
                additionalSelectorMethods: ['findBySelector', 'getElement', 'getElements'],
                // Methods this project uses whose first arg is intentionally a plain string
                allowedMethods: [],
            },
        ],

        // ── TypeScript rules ─────────────────────────────────────────────────────
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

        // ── General quality ──────────────────────────────────────────────────────
        'no-console': 'warn',
        'no-debugger': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        eqeqeq: ['error', 'always'],
        curly: ['error', 'all'],
    },

    overrides: [
        // ── Test files — stricter selector safety ──────────────────────────────
        {
            files: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
            rules: {
                // Escalate selector violations to errors (already error, but explicit)
                'no-hardcoded-selectors': 'error',

                // Ensure every awaitable Playwright call is awaited
                '@typescript-eslint/no-floating-promises': 'error',

                // Disallow .only() calls from being committed — use grep tagging instead
                'no-restricted-syntax': [
                    'error',
                    {
                        selector: "CallExpression[callee.property.name='only']",
                        message:
                            "test.only() must not be committed. Use test tags (@auth, @playback) and --grep instead.",
                    },
                    {
                        selector: "CallExpression[callee.property.name='skip']",
                        message:
                            "Committed test.skip() is discouraged. Track skipped tests in the issue backlog.",
                    },
                ],
            },
        },

        // ── Fixture files — slightly relaxed ──────────────────────────────────
        {
            files: ['fixtures/**/*.ts'],
            rules: {
                // Fixtures may use `any` when bridging untyped JSON
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-return': 'off',
            },
        },

        // ── ESLint rule source files (plain JS, not TS) ────────────────────────
        {
            files: ['eslint-rules/**/*.js'],
            env: { node: true },
            parserOptions: { project: null },
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',
            },
        },
    ],

    ignorePatterns: [
        'node_modules/',
        'dist/',
        'playwright-report/',
        'test-results/',
    ],
};
