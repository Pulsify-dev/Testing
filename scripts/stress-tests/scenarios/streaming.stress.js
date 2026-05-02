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
import { streamUrlQueryParams, recordPlayPayload, SEEDED_TRACK_IDS } from '../lib/payloads.js';

const cfg = resolveConfig();
const streamUrl = registerEndpoint('stream_url');
const recordPlay = registerEndpoint('record_play');

export const options = {
    stages: cfg.stages,
    thresholds: {
        ...cfg.thresholds,
        'http_req_duration{endpoint:stream_url}': ['p(95)<1500', 'p(99)<3000'],
        'http_req_failed{endpoint:stream_url}': ['rate<0.01'],
        'stream_url_success_rate': ['rate>0.99'],
    },
    userAgent: cfg.options.userAgent,
    insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
    discardResponseBodies: false,
    summaryTrendStats: cfg.options.summaryTrendStats,
    tags: {
        scenario: 'streaming',
        stage: __ENV.STAGE ?? 'stress',
        environment: __ENV.ENV ?? 'staging',
    },
};

export function setup() {
    console.log(`[setup] streaming stress — env=${cfg.envKey} stage=${cfg.stageKey}`);
    console.log(`[setup] ${SEEDED_TRACK_IDS.length} pre-seeded track IDs available`);
    const token = authenticate(cfg.baseUrl);
    return { baseUrl: cfg.baseUrl, sharedToken: token, trackIds: SEEDED_TRACK_IDS };
}

let _vuToken = null;
let _vuTokenAt = 0;
const TOKEN_TTL = 55 * 60 * 1000;

export default function streamingScenario(data) {
    const { baseUrl, sharedToken, trackIds } = data;

    const now = Date.now();
    if (!_vuToken || now - _vuTokenAt > TOKEN_TTL) {
        _vuToken = sharedToken ?? authenticate(baseUrl);
        _vuTokenAt = now;
    }
    if (!_vuToken) { randomSleep(1, 2); return; }

    const trackId = trackIds[Math.floor(Math.random() * trackIds.length)];

    // 1) Get stream URL
    {
        const { qs, tags } = streamUrlQueryParams();
        const url = buildUrl(`${baseUrl}/tracks/${trackId}/stream-url`, qs);
        const res = http.get(url, {
            headers: makeHeaders(_vuToken),
            tags,
            timeout: '15s',
        });
        const ok = check(res, {
            'stream-url: status 200': (r) => r.status === 200,
            'stream-url: < 1500ms': (r) => r.timings.duration < 1500,
        });
        streamUrl.successRate.add(ok);
        streamUrl.duration.add(res.timings.duration, tags);
        if (!ok) streamUrl.errors.add(1);
    }

    randomSleep(1, 3);

    // 2) Record play
    {
        const { body, tags } = recordPlayPayload();
        const res = http.post(`${baseUrl}/tracks/${trackId}/play`, body, {
            headers: makeHeaders(_vuToken),
            tags,
            timeout: '10s',
        });
        const ok = check(res, {
            'record-play: status 2xx': (r) => r.status >= 200 && r.status < 300,
        });
        recordPlay.successRate.add(ok);
        recordPlay.duration.add(res.timings.duration, tags);
        if (!ok) recordPlay.errors.add(1);
    }

    randomSleep(2, 5);
}

export function teardown() { console.log('[teardown] streaming stress complete.'); }
export function handleSummary(data) { return logSummary(data); }
