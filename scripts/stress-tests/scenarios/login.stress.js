

import http from 'k6/http';
import { check } from 'k6';

import {
    resolveConfig,
    makeHeaders,
    checkResponse,
    randomSleep,
    loginSuccessRate,
    loginDuration,
    authErrors,
    logSummary,
    extractAccessToken,
    extractRefreshToken,
} from '../lib/helpers.js';
import { loginPayload, logoutPayload } from '../lib/payloads.js';

const cfg = resolveConfig();

export const options = {

    stages: cfg.stages,

    thresholds: {
        ...cfg.thresholds,

        'http_req_duration{endpoint:login}': ['p(95)<800', 'p(99)<2000'],
        'http_req_failed{endpoint:login}': ['rate<0.005'],
        'login_success_rate': ['rate>0.99'],
    },

    userAgent: cfg.options.userAgent,
    insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
    discardResponseBodies: false,
    summaryTrendStats: cfg.options.summaryTrendStats,

    tags: {
        scenario: 'login',
        stage: __ENV.STAGE ?? 'stress',
        environment: __ENV.ENV ?? 'staging',
    },
};

export function setup() {
    console.log(`[setup] Login stress scenario starting`);
    console.log(`[setup] Environment : ${cfg.envKey} → ${cfg.baseUrl}`);
    console.log(`[setup] Stage       : ${cfg.stageKey}`);
    console.log(`[setup] Stages      : ${JSON.stringify(cfg.stages)}`);

    const probe = http.get(`${cfg.baseUrl}/health`, {
        tags: { endpoint: 'health' },
        timeout: '10s',
    });

    if (probe.status !== 200) {
        console.error(`[setup] Health check FAILED (${probe.status}). Aborting.`);
    } else {
        console.log(`[setup] Health check OK (${probe.status})`);
    }

    return { baseUrl: cfg.baseUrl };
}

export default function loginScenario(data) {
    const { baseUrl } = data;

    const { body, contentType, tags } = loginPayload();

    const params = {
        headers: makeHeaders(null),
        tags,
        timeout: '15s',
    };

    const res = http.post(`${baseUrl}/auth/login`, body, params);

    const accessToken = extractAccessToken(res.body);
    const refreshToken = extractRefreshToken(res.body);
    const hasToken = !!accessToken;

    const success = check(res, {
        'login: status 200': (r) => r.status === 200,
        'login: has access_token': () => hasToken,
        'login: content-type json': (r) =>
            (r.headers['Content-Type'] ?? '').includes('application/json'),
    });
    const perfOk = check(res, {
        'login: response < 800ms': (r) => r.timings.duration < 800,
    });

    loginSuccessRate.add(success);
    loginDuration.add(res.timings.duration, tags);

    if (!success || !perfOk) {
        authErrors.add(1);
        checkResponse(res, 'login', 200);
    }

    if ((__ENV.K6_ENABLE_LOGOUT_TRAFFIC ?? '0') === '1' && refreshToken && Math.random() > 0.7) {
        const { body: logoutBody, tags: logoutTags } = logoutPayload(refreshToken);

        const logoutRes = http.post(`${baseUrl}/auth/logout`, logoutBody, {
            headers: makeHeaders(accessToken),
            tags: logoutTags,
            timeout: '10s',
        });

        check(logoutRes, {
            'logout: status 200 or 204': (r) => r.status === 200 || r.status === 204,
        });
    }

    randomSleep(1, 3);
}

export function teardown() {
    console.log('[teardown] Login stress scenario complete.');
}

export function handleSummary(data) {
    return logSummary(data);
}
