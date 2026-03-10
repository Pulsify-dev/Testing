/**
 * lib/helpers.js — Shared K6 utilities
 *
 * Provides:
 *   - resolveConfig()      — Load k6.config.json and resolve environment + stage
 *   - buildStages()        — Convert config stages to K6-compatible format
 *   - buildThresholds()    — Merge global + endpoint thresholds for K6 options
 *   - makeHeaders()        — Construct common request headers
 *   - authenticate()       — POST /api/login and return bearer token
 *   - checkResponse()      — Standard response assertion helper
 *   - randomSleep()        — Think-time pause between requests
 *   - logSummary()         — handleSummary helper to emit JSON + console output
 */

import http    from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomIntBetween }     from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { loginPayload }         from './payloads.js';

// ---------------------------------------------------------------------------
// Custom metrics (available across all scenarios)
// ---------------------------------------------------------------------------

export const loginSuccessRate  = new Rate('login_success_rate');
export const searchSuccessRate = new Rate('search_success_rate');
export const authErrors        = new Counter('auth_errors');
export const searchErrors      = new Counter('search_errors');
export const loginDuration     = new Trend('login_duration', true);
export const searchDuration    = new Trend('search_duration', true);

// ---------------------------------------------------------------------------
// Config resolution
// ---------------------------------------------------------------------------

/**
 * Reads k6.config.json (as a shared k6 file) and returns the resolved
 * environment URL and stage definitions for the current run.
 *
 * In K6, JSON files must be imported as ES modules; this function encapsulates
 * that import so scenario files stay clean.
 *
 * @returns {{ baseUrl: string, stages: Array, thresholds: Object, options: Object }}
 */
export function resolveConfig() {
  // k6 supports static JSON imports natively
  const config = JSON.parse(open('../k6.config.json'));

  const envKey   = __ENV.ENV   ?? config.defaultEnvironment;
  const stageKey = __ENV.STAGE ?? 'stress';

  const env   = config.environments[envKey];
  const stage = config.stages[stageKey];

  if (!env) {
    throw new Error(`Unknown environment "${envKey}". Valid: ${Object.keys(config.environments).join(', ')}`);
  }
  if (!stage) {
    throw new Error(`Unknown stage "${stageKey}". Valid: ${Object.keys(config.stages).join(', ')}`);
  }

  return {
    baseUrl:    env.baseUrl,
    stages:     buildStages(stage.stages),
    thresholds: buildThresholds(config.thresholds),
    options:    config.options,
    stageKey,
    envKey,
  };
}

/**
 * Converts the config stages array into the format K6 expects.
 * (K6 already uses { duration, target } — this is a pass-through with
 *  validation and stripping of the "description" key.)
 *
 * @param {Array<{ duration: string, target: number, description: string }>} stages
 * @returns {Array<{ duration: string, target: number }>}
 */
export function buildStages(stages) {
  return stages.map(({ duration, target }) => ({ duration, target }));
}

/**
 * Merges global and per-endpoint thresholds from k6.config.json into the
 * flat object structure K6 expects in `export const options`.
 *
 * @param {{ global: Object, endpoints: Object }} thresholdConfig
 * @returns {Object}  K6 thresholds object
 */
export function buildThresholds(thresholdConfig) {
  const out = {};

  // Global thresholds
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

  // Per-endpoint thresholds
  for (const [, endpointCfg] of Object.entries(thresholdConfig.endpoints)) {
    for (const [metric, rules] of Object.entries(endpointCfg)) {
      const expressions = [];
      if (rules.p95) expressions.push(`p(95)<${parseDurationMs(rules.p95)}`);
      if (rules.p99) expressions.push(`p(99)<${parseDurationMs(rules.p99)}`);
      if (rules.rate !== undefined) expressions.push(`rate<${rules.rate}`);
      if (expressions.length) out[metric] = expressions;
    }
  }

  // Custom metric thresholds
  out['login_success_rate']  = ['rate>0.99'];
  out['search_success_rate'] = ['rate>0.99'];

  return out;
}

/**
 * Converts a human-readable duration string (e.g. "1500ms", "2s") to
 * a numeric millisecond value for use in K6 threshold expressions.
 * @param {string} str
 * @returns {number}
 */
function parseDurationMs(str) {
  if (str.endsWith('ms')) return parseInt(str, 10);
  if (str.endsWith('s'))  return parseInt(str, 10) * 1000;
  return parseInt(str, 10);
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

/**
 * Builds standard request headers for JSON API calls.
 *
 * @param {string}  [bearerToken] — JWT or session token (omit for unauthenticated requests)
 * @param {Object}  [extra]       — Additional headers to merge
 * @returns {Object}
 */
export function makeHeaders(bearerToken, extra = {}) {
  const headers = {
    'Content-Type':    'application/json',
    'Accept':          'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'X-Client-Name':   'Pulsify-K6',
    'X-Client-Version': '1.0.0',
    ...extra,
  };
  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }
  return headers;
}

/**
 * Authenticates against /api/login and returns the bearer token.
 * Aborts the VU iteration if login fails (critical prerequisite).
 *
 * @param {string} baseUrl
 * @param {Object} [credentials] — Optional { email, password } override
 * @returns {string|null}  Bearer token or null on failure
 */
export function authenticate(baseUrl, credentials = {}) {
  const { body, contentType, tags } = loginPayload(credentials);

  const res = http.post(`${baseUrl}/api/login`, body, {
    headers: makeHeaders(null),
    tags,
  });

  const ok = check(res, {
    'auth: status 200':          (r) => r.status === 200,
    'auth: has access_token':    (r) => {
      try { return !!JSON.parse(r.body).access_token; }
      catch { return false; }
    },
  });

  loginSuccessRate.add(ok);
  loginDuration.add(res.timings.duration, tags);

  if (!ok) {
    authErrors.add(1);
    console.warn(`[VU ${__VU}] Authentication failed: ${res.status} ${res.body?.substring(0, 200)}`);
    return null;
  }

  try {
    return JSON.parse(res.body).access_token;
  } catch {
    authErrors.add(1);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Response assertions
// ---------------------------------------------------------------------------

/**
 * Standard response check helper — reports pass/fail to K6 and returns boolean.
 *
 * @param {Object} res           — K6 http.Response object
 * @param {string} label         — Human-readable scenario label for logging
 * @param {number} [expectedStatus=200]
 * @returns {boolean}
 */
export function checkResponse(res, label, expectedStatus = 200) {
  const ok = check(res, {
    [`${label}: status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${label}: response time < 2000ms`]:   (r) => r.timings.duration < 2000,
    [`${label}: has response body`]:         (r) => r.body && r.body.length > 0,
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

// ---------------------------------------------------------------------------
// Think-time pause
// ---------------------------------------------------------------------------

/**
 * Pauses the VU for a realistic think time between requests.
 * Randomises between min and max seconds to avoid thundering-herd patterns.
 *
 * @param {number} [minSec=1]
 * @param {number} [maxSec=3]
 */
export function randomSleep(minSec = 1, maxSec = 3) {
  sleep(randomIntBetween(minSec * 10, maxSec * 10) / 10);
}

// ---------------------------------------------------------------------------
// Summary handler
// ---------------------------------------------------------------------------

/**
 * handleSummary callback — writes results/summary.json and prints to stdout.
 * Wire this in every scenario:
 *   export function handleSummary(data) { return logSummary(data); }
 *
 * @param {Object} data — K6 summary data object
 * @returns {Object}    — K6 output file map
 */
export function logSummary(data) {
  const ts        = new Date().toISOString();
  const stage     = __ENV.STAGE ?? 'unknown';
  const env       = __ENV.ENV   ?? 'unknown';

  const annotated = {
    meta: { timestamp: ts, stage, environment: env },
    ...data,
  };

  return {
    'results/summary.json': JSON.stringify(annotated, null, 2),
    stdout: `\n✔  Test complete — stage=${stage} env=${env} at ${ts}\n`,
  };
}
