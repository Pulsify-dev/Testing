/**
 * scenarios/search.stress.js — /api/search stress scenario
 *
 * Tests the search endpoint under configurable VU load.
 * Each iteration:
 *   1. Authenticate via /api/login (once per VU in setup, reused across iterations)
 *   2. POST /api/search with a randomised payload
 *   3. Assert 200 + results array in response body
 *   4. (Optional) POST a second paginated search request
 *   5. Random think-time pause
 *
 * Run:
 *   k6 run --env STAGE=stress --env ENV=staging scenarios/search.stress.js
 *
 * Override stage:
 *   k6 run --env STAGE=load --env ENV=local scenarios/search.stress.js
 */

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

// ---------------------------------------------------------------------------
// K6 options — resolved from k6.config.json at init time
// ---------------------------------------------------------------------------

const cfg = resolveConfig();

export const options = {
  stages: cfg.stages,

  thresholds: {
    ...cfg.thresholds,

    // Scenario-specific overrides
    'http_req_duration{endpoint:search}': ['p(95)<1200', 'p(99)<2500'],
    'http_req_failed{endpoint:search}':   ['rate<0.01'],
    'search_success_rate':                ['rate>0.99'],
  },

  userAgent:             cfg.options.userAgent,
  insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
  discardResponseBodies: false,
  summaryTrendStats:     cfg.options.summaryTrendStats,
  gracefulRampDown:      cfg.options.gracefulRampDown,
  gracefulStop:          cfg.options.gracefulStop,

  tags: {
    scenario:    'search',
    stage:       __ENV.STAGE ?? 'stress',
    environment: __ENV.ENV   ?? 'staging',
  },
};

// ---------------------------------------------------------------------------
// Setup — authenticates once and shares the token with all VUs
// ---------------------------------------------------------------------------

/**
 * Returns shared setup data available to every VU iteration.
 * @returns {{ baseUrl: string, accessToken: string|null }}
 */
export function setup() {
  console.log(`[setup] Search stress scenario starting`);
  console.log(`[setup] Environment : ${cfg.envKey} → ${cfg.baseUrl}`);
  console.log(`[setup] Stage       : ${cfg.stageKey}`);

  // Health check
  const probe = http.get(`${cfg.baseUrl}/health`, {
    tags: { endpoint: 'health' },
    timeout: '10s',
  });
  console.log(`[setup] Health check : ${probe.status}`);

  // Obtain a shared token (individual VUs will re-auth on expiry — see below)
  const accessToken = authenticate(cfg.baseUrl);
  if (!accessToken) {
    console.warn('[setup] WARNING: Could not obtain shared auth token. Searches will be anonymous.');
  }

  return {
    baseUrl:     cfg.baseUrl,
    accessToken: accessToken ?? null,
  };
}

// ---------------------------------------------------------------------------
// Default function — executed by every VU on every iteration
// ---------------------------------------------------------------------------

// VU-local token cache (avoids re-authenticating on every single iteration)
let _vuToken = null;
let _vuTokenObtainedAt = 0;
const TOKEN_TTL_MS = 55 * 60 * 1000; // 55 minutes (server tokens expire at 60 min)

/**
 * @param {{ baseUrl: string, accessToken: string|null }} data
 */
export default function searchScenario(data) {
  const { baseUrl, accessToken: sharedToken } = data;

  // ── 1. Ensure VU has a valid token ───────────────────────────────────────
  const now = Date.now();
  if (!_vuToken || (now - _vuTokenObtainedAt) > TOKEN_TTL_MS) {
    _vuToken = sharedToken ?? authenticate(baseUrl);
    _vuTokenObtainedAt = now;

    if (!_vuToken) {
      // Cannot search without auth — degrade gracefully and count as error
      searchErrors.add(1);
      searchSuccessRate.add(false);
      randomSleep(1, 2);
      return;
    }
  }

  // ── 2. Build search request ──────────────────────────────────────────────
  const { body, contentType, tags } = searchPayload();

  const params = {
    headers: makeHeaders(_vuToken),
    tags,
    timeout: '20s',
  };

  // ── 3. POST /api/search ──────────────────────────────────────────────────
  const res = http.post(`${baseUrl}/api/search`, body, params);

  // ── 4. Assertions ────────────────────────────────────────────────────────
  const hasResults = (() => {
    try {
      const json = JSON.parse(res.body);
      // Accept either { results: [] } or { data: { items: [] } } shapes
      return (
        Array.isArray(json.results) ||
        Array.isArray(json.data?.items) ||
        typeof json.total === 'number'
      );
    } catch {
      return false;
    }
  })();

  // Handle token expiry mid-run — invalidate VU cache and retry once
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
    'search: status 200':          (r) => r.status === 200,
    'search: has results shape':   () => hasResults,
    'search: response < 1200ms':   (r) => r.timings.duration < 1200,
    'search: content-type json':   (r) =>
      (r.headers['Content-Type'] ?? '').includes('application/json'),
  });

  searchSuccessRate.add(ok);
  searchDuration.add(res.timings.duration, tags);

  if (!ok) {
    searchErrors.add(1);
    checkResponse(res, 'search', 200);
  }

  // ── 5. Optional: paginated follow-up search (simulates infinite scroll) ──
  if (ok && hasResults && Math.random() > 0.6) {
    const json        = JSON.parse(res.body);
    const totalCount  = json.total ?? json.results?.length ?? 0;
    const prevLimit   = JSON.parse(body).limit ?? 20;

    if (totalCount > prevLimit) {
      const nextOffset = prevLimit + randomIntBetween(0, 2) * prevLimit;
      const page2Body  = JSON.parse(body);
      page2Body.offset = nextOffset;

      const page2Tags = { ...tags, page: '2' };
      const page2Res  = http.post(
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

  // ── 6. Think time ────────────────────────────────────────────────────────
  randomSleep(2, 5);
}

// ---------------------------------------------------------------------------
// Teardown
// ---------------------------------------------------------------------------

export function teardown() {
  console.log('[teardown] Search stress scenario complete.');
}

// ---------------------------------------------------------------------------
// Summary handler
// ---------------------------------------------------------------------------

export function handleSummary(data) {
  return logSummary(data);
}
