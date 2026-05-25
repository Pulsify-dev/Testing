

import { randomItem, randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const TEST_USER_EMAILS = [
    'stresstester1@gmail.com',
    'stresstester2@gmail.com',
    'stresstester3@gmail.com',
    'stresstester4@gmail.com',
    'stresstester5@gmail.com',
];

const TEST_USER_PASSWORD = 'password123';

// Pre-seeded track IDs on pulsify.page for streaming/engagement scenarios
export const SEEDED_TRACK_IDS = [
    '69d67db1f279d83706cfbda8',
    '69d6a28a0976023d9f624e15',
    '69e4f3f1fb195d458f23674c',
    '69e569e1f94e4c98313ab9ae',
    '69e56c4abaab71c570362b95',
    '69e952334443fd984504f283',
    '69e957dd4443fd984504f2cb',
    '69ea53e00839b6c7a198d8b6',
];

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
    const locale = randomItem(LOCALES);
    const device = randomItem(DEVICE_TYPES);

    const body = {
        email,
        password,
    };

    if ((__ENV.K6_LOGIN_INCLUDE_METADATA ?? '0') === '1') {
        body.remember_me = overrides.remember ?? (Math.random() > 0.5);
        body.client = {
            device_type: device,
            app_version: randomItem(CLIENT_VERSIONS),
            locale,
            timezone: 'UTC',
            screen_width: randomIntBetween(360, 1920),
            screen_height: randomIntBetween(640, 1080),
        };
        body.captcha_bypass_token = __ENV.K6_CAPTCHA_BYPASS_TOKEN ?? 'STRESS_TEST_BYPASS';
        body.mfa_code = null;
    }

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

export function searchQueryParams(overrides = {}) {
    const q = overrides.q ?? randomItem(SEARCH_TERMS);
    const type = overrides.type ?? randomItem(SEARCH_TYPES);
    const limit = overrides.limit ?? randomIntBetween(10, 50);
    const offset = overrides.offset ?? 0;
    return {
        qs: { q, type, limit, offset },
        tags: { endpoint: 'search', type },
    };
}

export function feedQueryParams(overrides = {}) {
    return {
        qs: {
            limit: overrides.limit ?? randomIntBetween(10, 30),
            offset: overrides.offset ?? randomIntBetween(0, 5) * 10,
        },
        tags: { endpoint: 'feed' },
    };
}


export function discoverQueryParams() {
    return {
        qs: { limit: randomIntBetween(10, 30) },
        tags: { endpoint: 'discover' },
    };
}


export function likePayload() {
    return {
        body: JSON.stringify({
            client: { device_type: randomItem(DEVICE_TYPES), app_version: randomItem(CLIENT_VERSIONS) },
        }),
        tags: { endpoint: 'like' },
    };
}

export function streamUrlQueryParams() {
    return {
        qs: {
            quality: randomItem(['low', 'medium', 'high', 'auto']),
            format: randomItem(['mp3', 'aac', 'opus']),
        },
        tags: { endpoint: 'stream_url' },
    };
}

export function recordPlayPayload() {
    return {
        body: JSON.stringify({
            position_sec: randomIntBetween(5, 240),
            duration_played_sec: randomIntBetween(5, 240),
            source: randomItem(['feed', 'search', 'playlist', 'profile', 'discover']),
            client: { device_type: randomItem(DEVICE_TYPES), app_version: randomItem(CLIENT_VERSIONS) },
        }),
        tags: { endpoint: 'record_play' },
    };
}


export function publicPlaylistsQueryParams() {
    return {
        qs: {
            limit: randomIntBetween(10, 30),
            offset: randomIntBetween(0, 3) * 10,
        },
        tags: { endpoint: 'public_playlists' },
    };
}

export function notificationsQueryParams() {
    return {
        qs: { limit: randomIntBetween(10, 30) },
        tags: { endpoint: 'notifications' },
    };
}

export const TEST_USERS = TEST_USER_EMAILS.map((email) => ({ email, password: TEST_USER_PASSWORD }));

export function logoutPayload(refreshToken) {
    return {
        body: JSON.stringify({
            refresh_token: refreshToken,
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
