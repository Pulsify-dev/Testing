/**
 * scenarios/run-all.js — Combined multi-scenario K6 runner
 *
 * Runs /api/login and /api/search concurrently as independent K6 scenarios
 * using the `scenarios` executor model. This is the recommended entry-point
 * for CI pipelines where both endpoints must be stress-tested together.
 *
 * VU allocation:
 *   - 60 % of VUs → login scenario
 *   - 40 % of VUs → search scenario
 *   (search VUs are pre-authenticated so they don't inflate login numbers)
 *
 * Run:
 *   k6 run --env STAGE=stress --env ENV=staging scenarios/run-all.js
 *
 * Docs: https://k6.io/docs/using-k6/scenarios/
 */

import http from 'k6/http';
import { check } from 'k6';

import {
  resolveConfig,
  authenticate,
  makeHeaders,
  checkResponse,
  randomSleep,
  loginSuccessRate,
  loginDuration,
  authErrors,
  searchSuccessRate,
  searchDuration,
  searchErrors,
  logSummary,
} from '../lib/helpers.js';
import { loginPayload, searchPayload, logoutPayload } from '../lib/payloads.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const cfg = resolveConfig();

// Derive per-scenario VU targets from the stage definition.
// The stages array drives the ramp curve; maxVUs is inferred from the highest
// target in that curve.
const maxVUsTotal = Math.max(...cfg.stages.map((s) => s.target));
const loginVUs    = Math.round(maxVUsTotal * 0.6);
const searchVUs   = Math.round(maxVUsTotal * 0.4);

// ---------------------------------------------------------------------------
// K6 options — scenarios executor
// ---------------------------------------------------------------------------

export const options = {
  scenarios: {
    // ── Login scenario ────────────────────────────────────────────────────
    login: {
      executor:        'ramping-vus',
      startVUs:        0,
      stages:          cfg.stages,
      gracefulRampDown: cfg.options.gracefulRampDown,
      gracefulStop:     cfg.options.gracefulStop,
      maxVUs:           loginVUs,
      exec:            'loginScenario',
      tags:            { scenario: 'login' },
    },

    // ── Search scenario ───────────────────────────────────────────────────
    search: {
      executor:        'ramping-vus',
      startVUs:        0,
      // Search ramps slightly offset so the login wave doesn't fully overlap
      stages:          cfg.stages.map((s, i) => ({
        ...s,
        // Stagger start: each stage starts 15 s after the login equivalent
        duration: i === 0 ? addSeconds(s.duration, 15) : s.duration,
      })),
      gracefulRampDown: cfg.options.gracefulRampDown,
      gracefulStop:     cfg.options.gracefulStop,
      maxVUs:           searchVUs,
      exec:            'searchScenario',
      tags:            { scenario: 'search' },
    },
  },

  thresholds: {
    ...cfg.thresholds,

    // Endpoint-specific thresholds (tagged metrics from each scenario)
    'http_req_duration{endpoint:login}':  ['p(95)<800',  'p(99)<2000'],
    'http_req_duration{endpoint:search}': ['p(95)<1200', 'p(99)<2500'],
    'http_req_failed{endpoint:login}':    ['rate<0.005'],
    'http_req_failed{endpoint:search}':   ['rate<0.01'],
    'login_success_rate':                 ['rate>0.99'],
    'search_success_rate':                ['rate>0.99'],
  },

  userAgent:             cfg.options.userAgent,
  insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
  discardResponseBodies: false,
  summaryTrendStats:     cfg.options.summaryTrendStats,

  tags: {
    suite:       'all',
    stage:       __ENV.STAGE ?? 'stress',
    environment: __ENV.ENV   ?? 'staging',
  },
};

// ---------------------------------------------------------------------------
// Setup — shared initialisation
// ---------------------------------------------------------------------------

export function setup() {
  console.log(`[setup] run-all — stage=${cfg.stageKey} env=${cfg.envKey}`);
  console.log(`[setup] loginVUs=${loginVUs}  searchVUs=${searchVUs}  total=${maxVUsTotal}`);
  console.log(`[setup] Base URL: ${cfg.baseUrl}`);

  const probe = http.get(`${cfg.baseUrl}/health`, { timeout: '10s' });
  if (probe.status !== 200) {
    console.error(`[setup] API health check FAILED (${probe.status})`);
  }

  // Pre-authenticate for the search scenario pool
  const sharedToken = authenticate(cfg.baseUrl);
  return { baseUrl: cfg.baseUrl, sharedToken: sharedToken ?? null };
}

// ---------------------------------------------------------------------------
// Login scenario executor (referenced by scenarios.login.exec)
// ---------------------------------------------------------------------------

export function loginScenario(data) {
  const { baseUrl } = data;

  const { body, tags } = loginPayload();
  const res = http.post(`${baseUrl}/api/login`, body, {
    headers: makeHeaders(null),
    tags,
    timeout: '15s',
  });

  const hasToken = (() => {
    try { return !!JSON.parse(res.body).access_token; }
    catch { return false; }
  })();

  const ok = check(res, {
    'login: status 200':       (r) => r.status === 200,
    'login: has access_token': () => hasToken,
    'login: response < 800ms': (r) => r.timings.duration < 800,
  });

  loginSuccessRate.add(ok);
  loginDuration.add(res.timings.duration, tags);
  if (!ok) authErrors.add(1);

  // Probabilistic logout (70 % of successful logins)
  if (hasToken && Math.random() > 0.3) {
    const token = JSON.parse(res.body).access_token;
    const { body: lb, tags: lt } = logoutPayload(token);
    http.post(`${baseUrl}/api/logout`, lb, {
      headers: makeHeaders(token), tags: lt, timeout: '10s',
    });
  }

  randomSleep(1, 3);
}

// ---------------------------------------------------------------------------
// Search scenario executor (referenced by scenarios.search.exec)
// ---------------------------------------------------------------------------

// VU-local token (one per VU, refreshed on expiry)
let _vuToken = null;
let _vuTokenTs = 0;
const TOKEN_TTL = 55 * 60 * 1000;

export function searchScenario(data) {
  const { baseUrl, sharedToken } = data;

  // Refresh token if missing or stale
  const now = Date.now();
  if (!_vuToken || (now - _vuTokenTs) > TOKEN_TTL) {
    _vuToken  = sharedToken ?? authenticate(baseUrl);
    _vuTokenTs = now;
    if (!_vuToken) {
      searchErrors.add(1);
      searchSuccessRate.add(false);
      randomSleep(1, 2);
      return;
    }
  }

  const { body, tags } = searchPayload();
  const res = http.post(`${baseUrl}/api/search`, body, {
    headers: makeHeaders(_vuToken),
    tags,
    timeout: '20s',
  });

  if (res.status === 401) {
    _vuToken = authenticate(baseUrl);
    _vuTokenTs = Date.now();
    searchErrors.add(1);
    searchSuccessRate.add(false);
    randomSleep(1, 2);
    return;
  }

  const hasResults = (() => {
    try {
      const j = JSON.parse(res.body);
      return Array.isArray(j.results) || Array.isArray(j.data?.items) || typeof j.total === 'number';
    } catch { return false; }
  })();

  const ok = check(res, {
    'search: status 200':        (r) => r.status === 200,
    'search: has results shape': () => hasResults,
    'search: response < 1200ms': (r) => r.timings.duration < 1200,
  });

  searchSuccessRate.add(ok);
  searchDuration.add(res.timings.duration, tags);
  if (!ok) searchErrors.add(1);

  randomSleep(2, 5);
}

// ---------------------------------------------------------------------------
// Teardown & summary
// ---------------------------------------------------------------------------

export function teardown() {
  console.log('[teardown] run-all complete.');
}

export function handleSummary(data) {
  return logSummary(data);
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Adds `extraSeconds` to a K6 duration string (e.g. "30s" → "45s").
 * Only handles integer-second values for simplicity.
 * @param {string} duration  e.g. "30s", "1m", "2h"
 * @param {number} extraSeconds
 * @returns {string}
 */
function addSeconds(duration, extraSeconds) {
  const match = duration.match(/^(\d+)(s|m|h)$/);
  if (!match) return duration;
  const [, value, unit] = match;
  const totalSeconds =
    parseInt(value, 10) *
    (unit === 's' ? 1 : unit === 'm' ? 60 : 3600) +
    extraSeconds;
  return `${totalSeconds}s`;
}
