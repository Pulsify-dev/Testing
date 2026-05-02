// Full user journey: login → search → stream-url → record play → like → feed.
// Catches issues that endpoint-isolated scenarios miss (token-refresh
// contention, downstream cache pollution, sequential dependency latency).

import http from 'k6/http';
import { check } from 'k6';
import {
    resolveConfig,
    authenticate,
    makeHeaders,
    buildUrl,
    randomSleep,
    registerEndpoint,
    logSummary,
} from '../lib/helpers.js';
import {
    searchQueryParams,
    feedQueryParams,
    likePayload,
    recordPlayPayload,
    streamUrlQueryParams,
    SEEDED_TRACK_IDS,
} from '../lib/payloads.js';

const cfg = resolveConfig();
const journey = registerEndpoint('journey');

export const options = {
    stages: cfg.stages,
    thresholds: {
        ...cfg.thresholds,
        'journey_duration': ['p(95)<10000', 'p(99)<20000'],
        'journey_success_rate': ['rate>0.95'],
        'http_req_failed': ['rate<0.02'],
    },
    userAgent: cfg.options.userAgent,
    insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
    discardResponseBodies: false,
    summaryTrendStats: cfg.options.summaryTrendStats,
    tags: {
        scenario: 'full_journey',
        stage: __ENV.STAGE ?? 'stress',
        environment: __ENV.ENV ?? 'staging',
    },
};

export function setup() {
    console.log(`[setup] full-journey stress — env=${cfg.envKey} stage=${cfg.stageKey}`);
    const probe = http.get(`${cfg.baseUrl}/health`, { timeout: '10s' });
    console.log(`[setup] health=${probe.status}`);
    return { baseUrl: cfg.baseUrl };
}

export default function fullJourneyScenario(data) {
    const { baseUrl } = data;
    const journeyStart = Date.now();
    let allOk = true;

    // 1) Login
    const token = authenticate(baseUrl);
    if (!token) {
        journey.errors.add(1);
        journey.successRate.add(false);
        randomSleep(1, 2);
        return;
    }
    randomSleep(0, 1);

    // 2) Search
    {
        const { qs, tags } = searchQueryParams();
        const url = buildUrl(`${baseUrl}/search`, qs);
        const res = http.get(url, {
            headers: makeHeaders(token),
            tags,
            timeout: '15s',
        });
        const ok = check(res, { 'journey/search: 200': (r) => r.status === 200 });
        if (!ok) allOk = false;
    }
    randomSleep(1, 2);

    // 3) Stream URL from a known seeded track
    const trackId = SEEDED_TRACK_IDS[Math.floor(Math.random() * SEEDED_TRACK_IDS.length)];
    {
        const { qs, tags } = streamUrlQueryParams();
        const url = buildUrl(`${baseUrl}/tracks/${trackId}/stream-url`, qs);
        const res = http.get(url, {
            headers: makeHeaders(token),
            tags,
            timeout: '15s',
        });
        const ok = check(res, { 'journey/stream-url: 200': (r) => r.status === 200 });
        if (!ok) allOk = false;
    }
    randomSleep(1, 2);

    // 4) Record play
    {
        const { body, tags } = recordPlayPayload();
        const res = http.post(`${baseUrl}/tracks/${trackId}/play`, body, {
            headers: makeHeaders(token), tags, timeout: '10s',
        });
        const ok = check(res, {
            'journey/record-play: 2xx': (r) => r.status >= 200 && r.status < 300,
        });
        if (!ok) allOk = false;
    }
    randomSleep(1, 2);

    // 5) Like
    {
        const { body, tags } = likePayload();
        const res = http.post(`${baseUrl}/tracks/${trackId}/like`, body, {
            headers: makeHeaders(token),
            responseCallback: http.expectedStatuses(200, 201, 204, 409),
            tags,
            timeout: '10s',
        });
        const ok = check(res, {
            'journey/like: 2xx or 409': (r) => (r.status >= 200 && r.status < 300) || r.status === 409,
        });
        if (!ok) allOk = false;
    }
    randomSleep(1, 2);

    // 6) Personal feed
    {
        const { qs, tags } = feedQueryParams();
        const url = buildUrl(`${baseUrl}/feed`, qs);
        const res = http.get(url, {
            headers: makeHeaders(token),
            tags,
            timeout: '15s',
        });
        const ok = check(res, { 'journey/feed: 200': (r) => r.status === 200 });
        if (!ok) allOk = false;
    }

    const elapsed = Date.now() - journeyStart;
    journey.duration.add(elapsed, { endpoint: 'journey' });
    journey.successRate.add(allOk);
    if (!allOk) journey.errors.add(1);

    randomSleep(2, 5);
}

export function teardown() { console.log('[teardown] full-journey stress complete.'); }
export function handleSummary(data) { return logSummary(data); }
