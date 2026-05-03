

import http from 'k6/http';
import { check } from 'k6';

import {
    resolveConfig,
    authenticate,
    makeHeaders,
    checkResponse,
    randomSleep,
    searchSuccessRate,
    searchDuration,
    searchErrors,
    logSummary,
} from '../lib/helpers.js';
import { searchPayload } from '../lib/payloads.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const cfg = resolveConfig();

export const options = {
    stages: cfg.stages,

    thresholds: {
        ...cfg.thresholds,

        'http_req_duration{endpoint:search}': ['p(95)<1200', 'p(99)<2500'],
        'http_req_failed{endpoint:search}': ['rate<0.01'],
        'search_success_rate': ['rate>0.99'],
    },

    userAgent: cfg.options.userAgent,
    insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
    discardResponseBodies: false,
    summaryTrendStats: cfg.options.summaryTrendStats,
    gracefulRampDown: cfg.options.gracefulRampDown,
    gracefulStop: cfg.options.gracefulStop,

    tags: {
        scenario: 'search',
        stage: __ENV.STAGE ?? 'stress',
        environment: __ENV.ENV ?? 'staging',
    },
};

export function setup() {
    console.log(`[setup] Search stress scenario starting`);
    console.log(`[setup] Environment : ${cfg.envKey} → ${cfg.baseUrl}`);
    console.log(`[setup] Stage       : ${cfg.stageKey}`);

    const probe = http.get(`${cfg.baseUrl}/health`, {
        tags: { endpoint: 'health' },
        timeout: '10s',
    });
    console.log(`[setup] Health check : ${probe.status}`);

    const accessToken = authenticate(cfg.baseUrl);
    if (!accessToken) {
        console.warn('[setup] WARNING: Could not obtain shared auth token. Searches will be anonymous.');
    }

    return {
        baseUrl: cfg.baseUrl,
        accessToken: accessToken ?? null,
    };
}

let _vuToken = null;
let _vuTokenObtainedAt = 0;
const TOKEN_TTL_MS = 55 * 60 * 1000;

export default function searchScenario(data) {
    const { baseUrl, accessToken: sharedToken } = data;

    const now = Date.now();
    if (!_vuToken || (now - _vuTokenObtainedAt) > TOKEN_TTL_MS) {
        _vuToken = sharedToken ?? authenticate(baseUrl);
        _vuTokenObtainedAt = now;

        if (!_vuToken) {

            searchErrors.add(1);
            searchSuccessRate.add(false);
            randomSleep(1, 2);
            return;
        }
    }

    const { body, contentType, tags } = searchPayload();

    const params = {
        headers: makeHeaders(_vuToken),
        tags,
        timeout: '20s',
    };

    const res = http.post(`${baseUrl}/api/search`, body, params);

    const hasResults = (() => {
        try {
            const json = JSON.parse(res.body);

            return (
                Array.isArray(json.results) ||
                Array.isArray(json.data?.items) ||
                typeof json.total === 'number'
            );
        } catch {
            return false;
        }
    })();

    if (res.status === 401) {
        console.warn(`[VU ${__VU}] Token expired mid-run, re-authenticating…`);
        _vuToken = authenticate(baseUrl);
        _vuTokenObtainedAt = Date.now();
        searchErrors.add(1);
        searchSuccessRate.add(false);
        randomSleep(1, 2);
        return;
    }

    const ok = check(res, {
        'search: status 200': (r) => r.status === 200,
        'search: has results shape': () => hasResults,
        'search: response < 1200ms': (r) => r.timings.duration < 1200,
        'search: content-type json': (r) =>
            (r.headers['Content-Type'] ?? '').includes('application/json'),
    });

    searchSuccessRate.add(ok);
    searchDuration.add(res.timings.duration, tags);

    if (!ok) {
        searchErrors.add(1);
        checkResponse(res, 'search', 200);
    }

    if (ok && hasResults && Math.random() > 0.6) {
        const json = JSON.parse(res.body);
        const totalCount = json.total ?? json.results?.length ?? 0;
        const prevLimit = JSON.parse(body).limit ?? 20;

        if (totalCount > prevLimit) {
            const nextOffset = prevLimit + randomIntBetween(0, 2) * prevLimit;
            const page2Body = JSON.parse(body);
            page2Body.offset = nextOffset;

            const page2Tags = { ...tags, page: '2' };
            const page2Res = http.post(
                `${baseUrl}/api/search`,
                JSON.stringify(page2Body),
                { headers: makeHeaders(_vuToken), tags: page2Tags, timeout: '20s' },
            );

            check(page2Res, {
                'search page2: status 200': (r) => r.status === 200,
            });

            searchDuration.add(page2Res.timings.duration, page2Tags);
        }
    }

    randomSleep(2, 5);
}

export function teardown() {
    console.log('[teardown] Search stress scenario complete.');
}

export function handleSummary(data) {
    return logSummary(data);
}
