/**
 * scenarios/login.stress.js — /api/login stress scenario
 *
 * Tests the authentication endpoint under configurable VU load.
 * Each iteration:
 *   1. POST /api/login with a realistic randomised payload
 *   2. Assert 200 + access_token in response body
 *   3. (Optional) POST /api/logout to clean up the session
 *   4. Random think-time pause
 *
 * Run:
 *   k6 run --env STAGE=stress --env ENV=staging scenarios/login.stress.js
 *
 * Override stage:
 *   k6 run --env STAGE=smoke  --env ENV=local   scenarios/login.stress.js
 */

import http from 'k6/http';
import { check } from 'k6';

import { resolveConfig, makeHeaders, checkResponse, randomSleep, loginSuccessRate, loginDuration, authErrors, logSummary } from '../lib/helpers.js';
import { loginPayload, logoutPayload } from '../lib/payloads.js';

// ---------------------------------------------------------------------------
// K6 options — resolved from k6.config.json at init time
// ---------------------------------------------------------------------------

const cfg = resolveConfig();

export const options = {
  // VU ramp stages from k6.config.json (e.g. stress → 0→100→500→0)
  stages: cfg.stages,

  // Per-metric pass/fail thresholds
  thresholds: {
    ...cfg.thresholds,

    // Scenario-specific overrides (tighter than global)
    'http_req_duration{endpoint:login}': ['p(95)<800', 'p(99)<2000'],
    'http_req_failed{endpoint:login}':   ['rate<0.005'],
    'login_success_rate':                ['rate>0.99'],
  },

  // K6 runtime options
  userAgent:             cfg.options.userAgent,
  insecureSkipTLSVerify: cfg.options.insecureSkipTLSVerify,
  discardResponseBodies: false,
  summaryTrendStats:     cfg.options.summaryTrendStats,
  gracefulRampDown:      cfg.options.gracefulRampDown,
  gracefulStop:          cfg.options.gracefulStop,

  // Tags applied to every metric in this scenario
  tags: {
    scenario:    'login',
    stage:       __ENV.STAGE ?? 'stress',
    environment: __ENV.ENV   ?? 'staging',
  },
};

// ---------------------------------------------------------------------------
// Setup — runs once before VUs start
// ---------------------------------------------------------------------------

/**
 * @returns {{ baseUrl: string }}
 */
export function setup() {
  console.log(`[setup] Login stress scenario starting`);
  console.log(`[setup] Environment : ${cfg.envKey} → ${cfg.baseUrl}`);
  console.log(`[setup] Stage       : ${cfg.stageKey}`);
  console.log(`[setup] Stages      : ${JSON.stringify(cfg.stages)}`);

  // Pre-flight check: verify the login endpoint is reachable before flooding it
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

// ---------------------------------------------------------------------------
// Default function — executed by every VU on every iteration
// ---------------------------------------------------------------------------

/**
 * @param {{ baseUrl: string }} data — Passed from setup()
 */
export default function loginScenario(data) {
  const { baseUrl } = data;

  // ── 1. Build request ─────────────────────────────────────────────────────
  const { body, contentType, tags } = loginPayload();

  const params = {
    headers: makeHeaders(null),
    tags,
    timeout: '15s',
  };

  // ── 2. POST /api/login ───────────────────────────────────────────────────
  const res = http.post(`${baseUrl}/api/login`, body, params);

  // ── 3. Assertions ────────────────────────────────────────────────────────
  const hasToken = (() => {
    try { return !!JSON.parse(res.body).access_token; }
    catch { return false; }
  })();

  const ok = check(res, {
    'login: status 200':       (r) => r.status === 200,
    'login: has access_token': () => hasToken,
    'login: response < 800ms': (r) => r.timings.duration < 800,
    'login: content-type json': (r) =>
      (r.headers['Content-Type'] ?? '').includes('application/json'),
  });

  loginSuccessRate.add(ok);
  loginDuration.add(res.timings.duration, tags);

  if (!ok) {
    authErrors.add(1);
    checkResponse(res, 'login', 200); // logs detail on failure
  }

  // ── 4. Optional: logout to release server-side session ──────────────────
  if (hasToken && Math.random() > 0.7) {
    const token = JSON.parse(res.body).access_token;
    const { body: logoutBody, tags: logoutTags } = logoutPayload(token);

    const logoutRes = http.post(`${baseUrl}/api/logout`, logoutBody, {
      headers: makeHeaders(token),
      tags:    logoutTags,
      timeout: '10s',
    });

    check(logoutRes, {
      'logout: status 200 or 204': (r) => r.status === 200 || r.status === 204,
    });
  }

  // ── 5. Think time ────────────────────────────────────────────────────────
  randomSleep(1, 3);
}

// ---------------------------------------------------------------------------
// Teardown — runs once after all VUs have finished
// ---------------------------------------------------------------------------

export function teardown() {
  console.log('[teardown] Login stress scenario complete.');
}

// ---------------------------------------------------------------------------
// Summary handler — writes results/summary.json
// ---------------------------------------------------------------------------

export function handleSummary(data) {
  return logSummary(data);
}
