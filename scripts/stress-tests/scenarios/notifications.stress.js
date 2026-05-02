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
import { notificationsQueryParams } from '../lib/payloads.js';

const cfg = resolveConfig();
const notifications = registerEndpoint('notifications');
const unreadCount = registerEndpoint('unread_count');

export const options = {
    stages: cfg.stages,
    thresholds: {
        ...cfg.thresholds,
        'http_req_duration{endpoint:notifications}': ['p(95)<1200', 'p(99)<2500'],
        'http_req_failed{endpoint:notifications}': ['rate<0.01'],
        'notifications_success_rate': ['rate>0.99'],
    },
    userAgent: cfg.options.userAgent,
    insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
    discardResponseBodies: false,
    summaryTrendStats: cfg.options.summaryTrendStats,
    tags: {
        scenario: 'notifications',
        stage: __ENV.STAGE ?? 'stress',
        environment: __ENV.ENV ?? 'staging',
    },
};

export function setup() {
    console.log(`[setup] notifications stress — env=${cfg.envKey} stage=${cfg.stageKey}`);
    const token = authenticate(cfg.baseUrl);
    return { baseUrl: cfg.baseUrl, sharedToken: token };
}

let _vuToken = null;
let _vuTokenAt = 0;
const TOKEN_TTL = 55 * 60 * 1000;

export default function notificationsScenario(data) {
    const { baseUrl, sharedToken } = data;
    const now = Date.now();
    if (!_vuToken || now - _vuTokenAt > TOKEN_TTL) {
        _vuToken = sharedToken ?? authenticate(baseUrl);
        _vuTokenAt = now;
    }
    if (!_vuToken) { randomSleep(1, 2); return; }

    // List notifications
    {
        const { qs, tags } = notificationsQueryParams();
        const url = buildUrl(`${baseUrl}/notifications/`, qs);
        const res = http.get(url, {
            headers: makeHeaders(_vuToken),
            tags,
            timeout: '15s',
        });
        const ok = check(res, {
            'notifications: status 200': (r) => r.status === 200,
            'notifications: < 1200ms': (r) => r.timings.duration < 1200,
        });
        notifications.successRate.add(ok);
        notifications.duration.add(res.timings.duration, tags);
        if (!ok) notifications.errors.add(1);
    }

    randomSleep(1, 2);

    // Unread count — high-frequency poll endpoint
    {
        const tags = { endpoint: 'unread_count' };
        const res = http.get(`${baseUrl}/notifications/unread-count`, {
            headers: makeHeaders(_vuToken),
            tags,
            timeout: '10s',
        });
        const ok = check(res, {
            'unread-count: status 200': (r) => r.status === 200,
            'unread-count: < 800ms': (r) => r.timings.duration < 800,
        });
        unreadCount.successRate.add(ok);
        unreadCount.duration.add(res.timings.duration, tags);
        if (!ok) unreadCount.errors.add(1);
    }

    randomSleep(2, 5);
}

export function teardown() { console.log('[teardown] notifications stress complete.'); }
export function handleSummary(data) { return logSummary(data); }
