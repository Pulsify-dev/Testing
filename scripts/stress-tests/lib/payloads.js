/**
 * lib/payloads.js — HTTP request payload blueprints
 *
 * Every endpoint's request body is defined here as a factory function so
 * each VU gets freshly generated, realistic data on every iteration.
 * Import these in scenario files — never hardcode payloads inline.
 *
 * Usage:
 *   import { loginPayload, searchPayload } from '../lib/payloads.js';
 *   const body = JSON.stringify(loginPayload());
 */

import { randomItem, randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// ---------------------------------------------------------------------------
// Seed data pools — vary these to prevent server-side result caching
// ---------------------------------------------------------------------------

const TEST_USER_EMAILS = [
    'k6.test.user1@pulsify-stress.dev',
    'k6.test.user2@pulsify-stress.dev',
    'k6.test.user3@pulsify-stress.dev',
    'k6.test.user4@pulsify-stress.dev',
    'k6.test.user5@pulsify-stress.dev',
];

const TEST_USER_PASSWORD = 'K6StressTest@2026!'; // shared test-account password

// Realistic music search terms to exercise the search index
const SEARCH_TERMS = [
    'midnight',
    'summer vibes',
    'acoustic covers',
    'hip hop 2025',
    'lo-fi beats',
    'jazz piano',
    'pop hits',
    'drake',
    'taylor swift',
    'classical morning',
    'workout energy',
    'chill playlist',
    'indie folk',
    'r&b slow jams',
    'electronic dance',
    'rock classics',
    'reggaeton',
    'k-pop',
    'afrobeats',
    'blues guitar',
];

const SEARCH_TYPES = ['track', 'album', 'artist', 'playlist', 'all'];
const SORT_OPTIONS = ['relevance', 'popularity', 'release_date', 'duration'];
const LOCALES = ['en-US', 'en-GB', 'ar-EG', 'es-ES', 'fr-FR', 'de-DE'];
const DEVICE_TYPES = ['web', 'ios', 'android'];
const CLIENT_VERSIONS = ['2.4.1', '2.5.0', '2.6.0-beta'];

// ---------------------------------------------------------------------------
// /api/login  — POST payload blueprint
// ---------------------------------------------------------------------------

/**
 * Generates a realistic /api/login request body.
 *
 * @param {Object} [overrides]          — Optional field overrides for targeted tests
 * @param {string} [overrides.email]    — Force a specific email
 * @param {string} [overrides.password] — Force a specific password
 * @param {boolean}[overrides.remember] — Force remember_me flag
 * @returns {{ body: string, contentType: string, tags: Object }}
 */
export function loginPayload(overrides = {}) {
    const email = overrides.email ?? randomItem(TEST_USER_EMAILS);
    const password = overrides.password ?? TEST_USER_PASSWORD;
    const remember = overrides.remember ?? (Math.random() > 0.5);
    const locale = randomItem(LOCALES);
    const device = randomItem(DEVICE_TYPES);

    const body = {
        // ── Core credentials ───────────────────────────────────────────────────
        email,
        password,
        remember_me: remember,

        // ── Client context ─────────────────────────────────────────────────────
        // Sent by the Pulsify frontend on every login request so the server can
        // apply geo-aware rate-limiting and session tagging.
        client: {
            device_type: device,
            app_version: randomItem(CLIENT_VERSIONS),
            locale,
            timezone: 'UTC',
            screen_width: randomIntBetween(360, 1920),
            screen_height: randomIntBetween(640, 1080),
        },

        // ── Security ───────────────────────────────────────────────────────────
        // Stress tests use a bypass token pre-authorised in the test environment.
        // This value must be set in k6 as an env var: K6_CAPTCHA_BYPASS_TOKEN.
        captcha_bypass_token: __ENV.K6_CAPTCHA_BYPASS_TOKEN ?? 'STRESS_TEST_BYPASS',

        // ── MFA (optional — set to null for load tests unless testing MFA flow) ─
        mfa_code: null,
    };

    return {
        body: JSON.stringify(body),
        contentType: 'application/json',
        // Tags are merged into K6 metrics for per-endpoint threshold evaluation
        tags: { endpoint: 'login', device, locale },
    };
}

// ---------------------------------------------------------------------------
// /api/search  — POST payload blueprint
// ---------------------------------------------------------------------------

/**
 * Generates a realistic /api/search request body.
 *
 * @param {Object} [overrides]
 * @param {string} [overrides.query]       — Force a specific search query
 * @param {string} [overrides.type]        — Force a search type (track|album|artist|playlist|all)
 * @param {number} [overrides.limit]       — Result page size
 * @param {number} [overrides.offset]      — Pagination offset
 * @param {string} [overrides.sort]        — Sort field
 * @param {string} [overrides.market]      — ISO 3166-1 marketplace code
 * @returns {{ body: string, contentType: string, tags: Object }}
 */
export function searchPayload(overrides = {}) {
    const query = overrides.query ?? randomItem(SEARCH_TERMS);
    const type = overrides.type ?? randomItem(SEARCH_TYPES);
    const limit = overrides.limit ?? randomIntBetween(10, 50);
    const offset = overrides.offset ?? randomIntBetween(0, 5) * limit;
    const sort = overrides.sort ?? randomItem(SORT_OPTIONS);
    const locale = randomItem(LOCALES);
    const device = randomItem(DEVICE_TYPES);

    // Derive market from locale (simplified mapping)
    const market = overrides.market ?? locale.split('-')[1] ?? 'US';

    const body = {
        // ── Search parameters ──────────────────────────────────────────────────
        query,
        type,              // "track" | "album" | "artist" | "playlist" | "all"
        limit,             // max results per page (10–50)
        offset,            // pagination offset
        sort,              // "relevance" | "popularity" | "release_date" | "duration"
        market,            // ISO 3166-1 alpha-2 — filters content by availability

        // ── Filters (optional — randomly exercised to vary server-side load) ──
        filters: {
            // Include explicit content (randomly toggled)
            explicit: Math.random() > 0.3,
            // Minimum track duration in seconds (0 = no filter)
            min_duration_sec: randomIntBetween(0, 60),
            // Maximum track duration in seconds (null = no filter)
            max_duration_sec: Math.random() > 0.5 ? randomIntBetween(120, 600) : null,
            // Release year range
            year_from: Math.random() > 0.5 ? randomIntBetween(1990, 2020) : null,
            year_to: null,
            // Genre tags (randomly sampled)
            genres: Math.random() > 0.6
                ? [randomItem(['pop', 'rock', 'hip-hop', 'jazz', 'classical', 'electronic'])]
                : [],
        },

        // ── Personalisation ────────────────────────────────────────────────────
        // Passed through from the authenticated session token; replaced by the
        // auth helper in scenario files.
        personalization: {
            locale,
            enable_recommendations: Math.random() > 0.5,
        },

        // ── Client context ─────────────────────────────────────────────────────
        client: {
            device_type: device,
            app_version: randomItem(CLIENT_VERSIONS),
            locale,
        },

        // ── Telemetry ──────────────────────────────────────────────────────────
        // Simulates the search-event telemetry the frontend sends with each query.
        telemetry: {
            session_id: randomString(16),
            query_id: randomString(24),
            input_method: randomItem(['keyboard', 'voice', 'barcode']),
            time_to_query_ms: randomIntBetween(200, 3000),
        },
    };

    return {
        body: JSON.stringify(body),
        contentType: 'application/json',
        tags: { endpoint: 'search', type, sort, device },
    };
}

// ---------------------------------------------------------------------------
// /api/logout  — POST payload blueprint (lightweight, included for completeness)
// ---------------------------------------------------------------------------

/**
 * Generates a /api/logout request body.
 * @param {string} sessionToken — Active session token to invalidate
 * @returns {{ body: string, contentType: string, tags: Object }}
 */
export function logoutPayload(sessionToken) {
    return {
        body: JSON.stringify({
            session_token: sessionToken,
            revoke_all: false, // true = sign out all devices
            client: {
                device_type: randomItem(DEVICE_TYPES),
                app_version: randomItem(CLIENT_VERSIONS),
            },
        }),
        contentType: 'application/json',
        tags: { endpoint: 'logout' },
    };
}
