import http from 'k6/http';
import { check } from 'k6';
import {
    resolveConfig,
    authenticate,
    makeHeaders,
    randomSleep,
    registerEndpoint,
    logSummary,
} from '../lib/helpers.js';
import { likePayload, SEEDED_TRACK_IDS, TEST_USERS } from '../lib/payloads.js';

const cfg = resolveConfig();
const like = registerEndpoint('like');
const unlike = registerEndpoint('unlike');

export const options = {
    stages: cfg.stages,
    thresholds: {
        ...cfg.thresholds,
        'http_req_duration{endpoint:like}': ['p(95)<1000', 'p(99)<2500'],
        'http_req_failed{endpoint:like}': ['rate<0.02'],
        'like_success_rate': ['rate>0.95'],
    },
    userAgent: cfg.options.userAgent,
    insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
    discardResponseBodies: false,
    summaryTrendStats: cfg.options.summaryTrendStats,
    tags: {
        scenario: 'engagement',
        stage: __ENV.STAGE ?? 'stress',
        environment: __ENV.ENV ?? 'staging',
    },
};

export function setup() {
    console.log(`[setup] engagement stress — env=${cfg.envKey} stage=${cfg.stageKey}`);
    console.log(`[setup] ${SEEDED_TRACK_IDS.length} pre-seeded track IDs available`);
    return { baseUrl: cfg.baseUrl, trackIds: SEEDED_TRACK_IDS };
}

let _vuToken = null;
let _vuTokenAt = 0;
const TOKEN_TTL = 55 * 60 * 1000;

export default function engagementScenario(data) {
    const { baseUrl, trackIds } = data;

    const now = Date.now();
    if (!_vuToken || now - _vuTokenAt > TOKEN_TTL) {
        const credentials = TEST_USERS[(__VU - 1) % TEST_USERS.length];
        _vuToken = authenticate(baseUrl, credentials);
        _vuTokenAt = now;
    }
    if (!_vuToken) { randomSleep(1, 2); return; }

    const trackId = trackIds[Math.floor(Math.random() * trackIds.length)];

    // Like
    {
        const { body, tags } = likePayload();
        const res = http.post(`${baseUrl}/tracks/${trackId}/like`, body, {
            headers: makeHeaders(_vuToken),
            responseCallback: http.expectedStatuses(200, 201, 204, 409),
            tags,
            timeout: '10s',
        });
        // 409 = already liked — counts as OK under load
        const ok = check(res, {
            'like: ok or already-liked': (r) => [200, 201, 204, 409].includes(r.status),
        });
        like.successRate.add(ok);
        like.duration.add(res.timings.duration, tags);
        if (!ok) like.errors.add(1);
    }

    randomSleep(1, 2);

    // Unlike 50% of the time to avoid runaway like-counter inflation
    if (Math.random() > 0.5) {
        const tags = { endpoint: 'unlike' };
        const res = http.del(`${baseUrl}/tracks/${trackId}/like`, null, {
            headers: makeHeaders(_vuToken),
            responseCallback: http.expectedStatuses(200, 204, 404),
            tags,
            timeout: '10s',
        });
        const ok = check(res, {
            'unlike: ok': (r) => [200, 204, 404].includes(r.status),
        });
        unlike.successRate.add(ok);
        unlike.duration.add(res.timings.duration, tags);
        if (!ok) unlike.errors.add(1);
    }

    randomSleep(2, 4);
}

export function teardown() { console.log('[teardown] engagement stress complete.'); }
export function handleSummary(data) { return logSummary(data); }
