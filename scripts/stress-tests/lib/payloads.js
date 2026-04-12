

import { randomItem, randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const TEST_USER_EMAILS = [
    'k6.test.user1@pulsify-stress.dev',
    'k6.test.user2@pulsify-stress.dev',
    'k6.test.user3@pulsify-stress.dev',
    'k6.test.user4@pulsify-stress.dev',
    'k6.test.user5@pulsify-stress.dev',
];

const TEST_USER_PASSWORD = 'K6StressTest@2026!';

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

export function loginPayload(overrides = {}) {
    const email = overrides.email ?? randomItem(TEST_USER_EMAILS);
    const password = overrides.password ?? TEST_USER_PASSWORD;
    const remember = overrides.remember ?? (Math.random() > 0.5);
    const locale = randomItem(LOCALES);
    const device = randomItem(DEVICE_TYPES);

    const body = {

        email,
        password,
        remember_me: remember,

        client: {
            device_type: device,
            app_version: randomItem(CLIENT_VERSIONS),
            locale,
            timezone: 'UTC',
            screen_width: randomIntBetween(360, 1920),
            screen_height: randomIntBetween(640, 1080),
        },

        captcha_bypass_token: __ENV.K6_CAPTCHA_BYPASS_TOKEN ?? 'STRESS_TEST_BYPASS',

        mfa_code: null,
    };

    return {
        body: JSON.stringify(body),
        contentType: 'application/json',

        tags: { endpoint: 'login', device, locale },
    };
}

export function searchPayload(overrides = {}) {
    const query = overrides.query ?? randomItem(SEARCH_TERMS);
    const type = overrides.type ?? randomItem(SEARCH_TYPES);
    const limit = overrides.limit ?? randomIntBetween(10, 50);
    const offset = overrides.offset ?? randomIntBetween(0, 5) * limit;
    const sort = overrides.sort ?? randomItem(SORT_OPTIONS);
    const locale = randomItem(LOCALES);
    const device = randomItem(DEVICE_TYPES);

    const market = overrides.market ?? locale.split('-')[1] ?? 'US';

    const body = {

        query,
        type,
        limit,
        offset,
        sort,
        market,

        filters: {

            explicit: Math.random() > 0.3,

            min_duration_sec: randomIntBetween(0, 60),

            max_duration_sec: Math.random() > 0.5 ? randomIntBetween(120, 600) : null,

            year_from: Math.random() > 0.5 ? randomIntBetween(1990, 2020) : null,
            year_to: null,

            genres: Math.random() > 0.6
                ? [randomItem(['pop', 'rock', 'hip-hop', 'jazz', 'classical', 'electronic'])]
                : [],
        },

        personalization: {
            locale,
            enable_recommendations: Math.random() > 0.5,
        },

        client: {
            device_type: device,
            app_version: randomItem(CLIENT_VERSIONS),
            locale,
        },

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

export function logoutPayload(sessionToken) {
    return {
        body: JSON.stringify({
            session_token: sessionToken,
            revoke_all: false,
            client: {
                device_type: randomItem(DEVICE_TYPES),
                app_version: randomItem(CLIENT_VERSIONS),
            },
        }),
        contentType: 'application/json',
        tags: { endpoint: 'logout' },
    };
}
