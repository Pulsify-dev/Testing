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
import { feedQueryParams, discoverQueryParams } from '../lib/payloads.js';

const cfg = resolveConfig();
const feed = registerEndpoint('feed');
const discover = registerEndpoint('discover');

export const options = {
    stages: cfg.stages,
    thresholds: {
        ...cfg.thresholds,
        'http_req_duration{endpoint:feed}': ['p(95)<1500', 'p(99)<3000'],
        'http_req_duration{endpoint:discover}': ['p(95)<1500', 'p(99)<3000'],
        'http_req_failed{endpoint:feed}': ['rate<0.01'],
        'http_req_failed{endpoint:discover}': ['rate<0.01'],
        'feed_success_rate': ['rate>0.99'],
        'discover_success_rate': ['rate>0.99'],
    },
    userAgent: cfg.options.userAgent,
    insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
    discardResponseBodies: false,
    summaryTrendStats: cfg.options.summaryTrendStats,
    tags: {
        scenario: 'feed',
        stage: __ENV.STAGE ?? 'stress',
        environment: __ENV.ENV ?? 'staging',
    },
};

export function setup() {
    console.log(`[setup] feed stress — env=${cfg.envKey} stage=${cfg.stageKey}`);
    const probe = http.get(`${cfg.baseUrl}/health`, { timeout: '10s' });
    console.log(`[setup] health=${probe.status}`);
    const token = authenticate(cfg.baseUrl);
    return { baseUrl: cfg.baseUrl, sharedToken: token };
}

let _vuToken = null;
const TOKEN_TTL = 55 * 60 * 1000;
let _vuTokenAt = 0;

export default function feedScenario(data) {
    const { baseUrl, sharedToken } = data;
    const now = Date.now();
    if (!_vuToken || now - _vuTokenAt > TOKEN_TTL) {
        _vuToken = sharedToken ?? authenticate(baseUrl);
        _vuTokenAt = now;
    }
    if (!_vuToken) {
        feed.errors.add(1);
        feed.successRate.add(false);
        randomSleep(1, 2);
        return;
    }

    // Personal feed (auth required)
    {
        const { qs, tags } = feedQueryParams();
        const url = buildUrl(`${baseUrl}/feed`, qs);
        const res = http.get(url, {
            headers: makeHeaders(_vuToken),
            tags,
            timeout: '15s',
        });
        const ok = check(res, {
            'feed: status 200': (r) => r.status === 200,
            'feed: < 1500ms': (r) => r.timings.duration < 1500,
        });
        feed.successRate.add(ok);
        feed.duration.add(res.timings.duration, tags);
        if (!ok) feed.errors.add(1);
    }

    randomSleep(1, 2);

    // Discover home (optionalAuth — works with or without token)
    {
        const { qs, tags } = discoverQueryParams();
        const url = buildUrl(`${baseUrl}/discover`, qs);
        const res = http.get(url, {
            headers: makeHeaders(_vuToken),
            tags,
            timeout: '15s',
        });
        const ok = check(res, {
            'discover: status 200': (r) => r.status === 200,
            'discover: < 1500ms': (r) => r.timings.duration < 1500,
        });
        discover.successRate.add(ok);
        discover.duration.add(res.timings.duration, tags);
        if (!ok) discover.errors.add(1);
    }

    randomSleep(2, 4);
}

export function teardown() { console.log('[teardown] feed stress complete.'); }
export function handleSummary(data) { return logSummary(data); }
