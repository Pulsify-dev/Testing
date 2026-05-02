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
import { publicPlaylistsQueryParams } from '../lib/payloads.js';

const cfg = resolveConfig();
const publicPlaylists = registerEndpoint('public_playlists');
const myPlaylists = registerEndpoint('my_playlists');

export const options = {
    stages: cfg.stages,
    thresholds: {
        ...cfg.thresholds,
        'http_req_duration{endpoint:public_playlists}': ['p(95)<1500', 'p(99)<3000'],
        'http_req_failed{endpoint:public_playlists}': ['rate<0.01'],
        'public_playlists_success_rate': ['rate>0.99'],
    },
    userAgent: cfg.options.userAgent,
    insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
    discardResponseBodies: false,
    summaryTrendStats: cfg.options.summaryTrendStats,
    tags: {
        scenario: 'playlists',
        stage: __ENV.STAGE ?? 'stress',
        environment: __ENV.ENV ?? 'staging',
    },
};

export function setup() {
    console.log(`[setup] playlists stress — env=${cfg.envKey} stage=${cfg.stageKey}`);
    const token = authenticate(cfg.baseUrl);
    return { baseUrl: cfg.baseUrl, sharedToken: token };
}

let _vuToken = null;
let _vuTokenAt = 0;
const TOKEN_TTL = 55 * 60 * 1000;

export default function playlistsScenario(data) {
    const { baseUrl, sharedToken } = data;
    const now = Date.now();
    if (!_vuToken || now - _vuTokenAt > TOKEN_TTL) {
        _vuToken = sharedToken ?? authenticate(baseUrl);
        _vuTokenAt = now;
    }

    // Public discovery (no auth required) — pure read aggregation
    {
        const { qs, tags } = publicPlaylistsQueryParams();
        const url = buildUrl(`${baseUrl}/playlists/discover/public`, qs);
        const res = http.get(url, {
            tags,
            timeout: '15s',
        });
        const ok = check(res, {
            'public-playlists: status 200': (r) => r.status === 200,
            'public-playlists: < 1500ms': (r) => r.timings.duration < 1500,
        });
        publicPlaylists.successRate.add(ok);
        publicPlaylists.duration.add(res.timings.duration, tags);
        if (!ok) publicPlaylists.errors.add(1);
    }

    randomSleep(1, 3);

    // My playlists (auth required) — per-user read
    if (_vuToken) {
        const tags = { endpoint: 'my_playlists' };
        const res = http.get(`${baseUrl}/playlists/`, {
            headers: makeHeaders(_vuToken),
            tags,
            timeout: '15s',
        });
        const ok = check(res, {
            'my-playlists: status 200': (r) => r.status === 200,
        });
        myPlaylists.successRate.add(ok);
        myPlaylists.duration.add(res.timings.duration, tags);
        if (!ok) myPlaylists.errors.add(1);
    }

    randomSleep(2, 4);
}

export function teardown() { console.log('[teardown] playlists stress complete.'); }
export function handleSummary(data) { return logSummary(data); }
