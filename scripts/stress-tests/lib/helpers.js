

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { loginPayload } from './payloads.js';

export const loginSuccessRate = new Rate('login_success_rate');
export const searchSuccessRate = new Rate('search_success_rate');
export const authErrors = new Counter('auth_errors');
export const searchErrors = new Counter('search_errors');
export const loginDuration = new Trend('login_duration', true);
export const searchDuration = new Trend('search_duration', true);

export function resolveConfig() {
    const config = JSON.parse(open('../../../stress-tests/k6.config.json'));

    const envKey = __ENV.ENV ?? config.defaultEnvironment;
    const stageKey = __ENV.STAGE ?? 'stress';

    const env = config.environments[envKey];
    const stage = config.stages[stageKey];

    if (!env) {
        throw new Error(`Unknown environment "${envKey}". Valid: ${Object.keys(config.environments).join(', ')}`);
    }
    if (!stage) {
        throw new Error(`Unknown stage "${stageKey}". Valid: ${Object.keys(config.stages).join(', ')}`);
    }

    return {
        baseUrl: env.baseUrl,
        stages: buildStages(stage.stages),
        thresholds: buildThresholds(config.thresholds),
        options: config.options,
        stageKey,
        envKey,
    };
}

export function buildStages(stages) {
    return stages.map(({ duration, target }) => ({ duration, target }));
}

export function buildThresholds(thresholdConfig) {
    const out = {};

    const g = thresholdConfig.global;
    if (g['http_req_duration']) {
        out['http_req_duration'] = [
            `p(95)<${parseDurationMs(g['http_req_duration'].p95)}`,
            `p(99)<${parseDurationMs(g['http_req_duration'].p99)}`,
        ];
    }
    if (g['http_req_failed']) {
        out['http_req_failed'] = [`rate<${g['http_req_failed'].rate}`];
    }

    return out;
}

function parseDurationMs(str) {
    if (str.endsWith('ms')) return parseInt(str, 10);
    if (str.endsWith('s')) return parseInt(str, 10) * 1000;
    return parseInt(str, 10);
}

export function makeHeaders(bearerToken, extra = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-Client-Name': 'Pulsify-K6',
        'X-Client-Version': '1.0.0',
        ...extra,
    };
    if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
    }
    return headers;
}

export function authenticate(baseUrl, credentials = {}) {
    const { body, contentType, tags } = loginPayload(credentials);

    const res = http.post(`${baseUrl}/auth/login`, body, {
        headers: makeHeaders(null),
        tags,
    });

    const ok = check(res, {
        'auth: status 200': (r) => r.status === 200,
        'auth: has access_token': (r) => !!extractAccessToken(r.body),
    });

    loginSuccessRate.add(ok);
    loginDuration.add(res.timings.duration, tags);

    if (!ok) {
        authErrors.add(1);
        console.warn(`[VU ${__VU}] Authentication failed: ${res.status} ${res.body?.substring(0, 200)}`);
        return null;
    }

    try {
        return extractAccessToken(res.body);
    } catch {
        authErrors.add(1);
        return null;
    }
}

export function extractAccessToken(body) {
    try {
        const j = typeof body === 'string' ? JSON.parse(body) : body;
        return j?.access_token || j?.accessToken || j?.data?.access_token || j?.data?.accessToken || j?.token || null;
    } catch {
        return null;
    }
}

export function extractRefreshToken(body) {
    try {
        const j = typeof body === 'string' ? JSON.parse(body) : body;
        return j?.refresh_token || j?.refreshToken || j?.data?.refresh_token || j?.data?.refreshToken || null;
    } catch {
        return null;
    }
}

// Generic per-endpoint metric registry — scenarios call registerEndpoint('feed')
// to get back { successRate, duration, errors } trio without polluting helpers.js
const _endpointMetrics = {};
export function registerEndpoint(name) {
    if (_endpointMetrics[name]) return _endpointMetrics[name];
    _endpointMetrics[name] = {
        successRate: new Rate(`${name}_success_rate`),
        duration: new Trend(`${name}_duration`, true),
        errors: new Counter(`${name}_errors`),
    };
    return _endpointMetrics[name];
}

export function checkResponse(res, label, expectedStatus = 200) {
    const ok = check(res, {
        [`${label}: status ${expectedStatus}`]: (r) => r.status === expectedStatus,
        [`${label}: response time < 2000ms`]: (r) => r.timings.duration < 2000,
        [`${label}: has response body`]: (r) => r.body && r.body.length > 0,
    });

    if (!ok) {
        console.warn(
            `[VU ${__VU} iter ${__ITER}] ${label} FAILED: ` +
            `status=${res.status} duration=${res.timings.duration}ms ` +
            `body=${res.body?.substring(0, 300)}`
        );
    }

    return ok;
}

// k6 does not support a 'params' key for query strings on GET requests.
// Use this helper to build the URL with encoded query params.
export function buildUrl(base, qs = {}) {
    const parts = Object.entries(qs)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return parts.length ? `${base}?${parts.join('&')}` : base;
}

export function randomSleep(minSec = 1, maxSec = 3) {
    sleep(randomIntBetween(minSec * 10, maxSec * 10) / 10);
}

export function logSummary(data) {
    const ts = new Date().toISOString();
    const stage = __ENV.STAGE ?? 'unknown';
    const env = __ENV.ENV ?? 'unknown';

    const annotated = {
        meta: { timestamp: ts, stage, environment: env },
        ...data,
    };

    return {
        'results/summary.json': JSON.stringify(annotated, null, 2),
        stdout: `\n✔  Test complete — stage=${stage} env=${env} at ${ts}\n`,
    };
}
