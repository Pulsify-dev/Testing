# Pulsify Backend Stress Testing — Plan

## Context

Pulsify is a SoundCloud-style social streaming platform (Node.js/Express + Mongoose + Meilisearch + Redis, Socket.io for real-time). Functional E2E coverage exists for Modules 1–13 via Playwright. Non-functional behavior — how the API behaves under concurrent traffic — is not yet validated. The course Phase 2 report and project main doc set explicit performance NFRs (p95 < 1.5 s, p99 < 3 s, error rate < 1 %, scale targets up to 1000+ concurrent VUs). We need a structured stress-test pass before final demo to (a) prove those NFRs hold, (b) find the breakpoint, and (c) catch regressions like memory leaks, connection-pool exhaustion, or queue overflow under sustained load.

A K6 scaffold already exists at [../stress-tests/](../stress-tests/) and [../scripts/stress-tests/](../scripts/stress-tests/) with login + search scenarios wired up. The plan extends that scaffold rather than starting from scratch.

---

## 1. What stress testing is

Stress testing is **deliberately pushing the system past its expected operating range** to observe how it degrades and where it breaks. Distinct from neighbouring concepts:

| Test type | Load profile | Question it answers |
|-----------|--------------|---------------------|
| **Smoke** | 1–2 VUs, 1 min | Does the system work at all? |
| **Load** | Normal peak (50 VUs) | Does it meet SLAs at expected traffic? |
| **Stress** | Beyond peak (500 VUs, sustained) | Does it stay healthy when overloaded? |
| **Spike** | 0 → 1000 VUs in 10 s | Can it absorb a sudden surge (viral track)? |
| **Soak** | 100 VUs × 4 h | Does it leak memory / degrade over time? |
| **Breakpoint** | Step ramp 100→1200 VUs | At what load does it fall over? |

All six already have stage definitions in [k6.config.json](../stress-tests/k6.config.json). "Stress testing" in this plan covers running all six profiles, with stress + spike + breakpoint as the headline runs.

## 2. Goal

Three concrete, measurable outcomes:

1. **Verify NFRs hold under stress.** Global thresholds (p95 < 1500 ms, p99 < 3000 ms, http_req_failed < 1 %) and per-endpoint thresholds (login p95 < 800 ms, search p95 < 1200 ms) must pass at the `stress` stage (500 VUs sustained 2 min).
2. **Find the breakpoint.** Determine the VU count at which error-rate exceeds 1 % or p95 exceeds 3 s. This becomes the documented capacity ceiling.
3. **Surface failure modes.** Catch issues that only appear under load: DB connection-pool saturation, Redis eviction, Meilisearch query-queue backup, bullmq job lag, JWT verification CPU contention, file-descriptor leaks on stream endpoints, rate-limit misconfiguration.

A successful pass produces: a `results/` artifact set per stage (JSON + HTML report), a one-page summary of pass/fail per threshold, and a list of remediation items if anything failed.

## 3. How we apply it

### 3.1 Target endpoints (extend beyond login + search)

The current scaffold only covers `/api/login` and `/api/search`. To meaningfully stress the system we add scenarios that exercise the resource-intensive code paths. Candidate endpoint list (mounted under the API router at [Backend/src/routes/index.js](../../Backend/src/routes/index.js)):

| # | Method + Path | Module | Why it matters under load |
|---|---------------|--------|---------------------------|
| 1 | POST /auth/login | 1 | JWT signing CPU; Redis session writes |
| 2 | POST /auth/refresh | 1 | High-frequency token churn |
| 3 | GET  /search?q=... | 8 | Meilisearch query throughput |
| 4 | GET  /discover | 8 | Aggregations + recommendations |
| 5 | GET  /feed | 8 | Follow-graph fan-out reads |
| 6 | POST /tracks | 4 | Upload + bullmq transcoding queue |
| 7 | POST /tracks/:id/stream-url | 5 | Pre-signed URL generation |
| 8 | GET  /tracks/:id/stream | 5 | Range requests, file I/O |
| 9 | POST /tracks/:id/like | 6 | Write contention on counters |
| 10 | GET  /playlists/discover/public | 7 | Sorted aggregations |
| 11 | GET  /notifications | 10 | Per-user reads, Socket.io interplay |
| 12 | GET  /users/:id/profile | 2 | Cache-friendly read baseline |

Each leaf path is confirmed against its route file (`*.routes.js`) before scenario implementation.

### 3.2 Scenario architecture

Build on the existing pattern in [scenarios/run-all.js](../scripts/stress-tests/scenarios/run-all.js). Reuse:

- `resolveConfig()`, `authenticate()`, `makeHeaders()`, `checkResponse()`, `randomSleep()` from [lib/helpers.js](../scripts/stress-tests/lib/helpers.js)
- `loginPayload()`, `searchPayload()` from [lib/payloads.js](../scripts/stress-tests/lib/payloads.js) — extend with new payload builders for tracks/feed/like/stream

Add one scenario file per endpoint group plus a master orchestrator:

```
Testing/scripts/stress-tests/scenarios/
├── login.stress.js          (exists)
├── search.stress.js         (exists)
├── run-all.js               (exists — extend)
├── feed.stress.js           (new)
├── streaming.stress.js      (new — stream-url + range GET)
├── engagement.stress.js     (new — like/repost/comment)
├── playlists.stress.js      (new)
├── notifications.stress.js  (new)
└── full-journey.stress.js   (new — realistic chained user journey)
```

The **full-journey scenario** is the most important addition: each VU executes a realistic chain (login → search → open track → stream → like → check feed) with `randomSleep` between steps. This catches issues that isolated endpoint hammering misses — e.g., session token refresh contention, downstream cache pollution.

### 3.3 Test data prerequisites

- 5 pre-seeded test users already defined in `payloads.js` (`k6.test.userN@pulsify-stress.dev`).
- For new scenarios we need: ~50 seeded tracks across users, ~20 seeded playlists, follow relationships between test users. Add a one-shot seed script `Testing/scripts/stress-tests/seed/seed-stress-data.js` that POSTs the fixtures via the API once before the first run.
- Captcha bypass token (`K6_CAPTCHA_BYPASS_TOKEN` env var) already plumbed in `payloads.js` — confirm backend honours it in non-prod.

### 3.4 Execution plan (run order)

Each step uses the npm scripts already defined in [stress-tests/package.json](../stress-tests/package.json):

1. **Local smoke** — `npm run test:local` against `localhost:4000`. Validates scenario code; not a real stress test.
2. **Staging smoke** — `npm run test:smoke`. Confirms staging is reachable + auth works.
3. **Staging load** — `npm run test:load` (50 VUs × 3 min). Establishes baseline; SLAs must pass here.
4. **Staging stress** — `npm run test:stress` (500 VUs × 2 min sustain). Primary NFR validation.
5. **Staging spike** — `npm run test:spike` (0→1000 VUs in 10 s). Resilience to viral surges.
6. **Staging breakpoint** — `npm run test:breakpoint` (100→1200 VU step). Capacity ceiling.
7. **Staging soak** — `npm run test:soak` (100 VUs × 4 h). Run overnight; check for memory growth / degradation.

Production is **out of scope** for the course deliverable.

### 3.5 Observability during runs

For each run capture, alongside the K6 JSON/HTML output:

- Backend container CPU + memory (`docker stats`, host metrics, or APM dashboard).
- MongoDB connection count + slow-query log.
- Redis memory usage + evicted-keys counter.
- Meilisearch query latency.

This is what differentiates "the test passed/failed" from "and here's *why*".

### 3.6 Reporting

Produce `Testing/stress-tests/results/STRESS_TEST_REPORT.md` with one section per stage:

- Stage config (VU profile, duration)
- Threshold pass/fail table
- Top 5 slowest endpoints (p95)
- Error-rate breakdown by endpoint
- Resource utilisation peaks (if observability captured)
- Findings + remediation items

---

## Critical files

- [stress-tests/k6.config.json](../stress-tests/k6.config.json) — stages + thresholds; **no changes needed**
- [stress-tests/package.json](../stress-tests/package.json) — npm scripts; add `test:journey` script
- [scripts/stress-tests/lib/helpers.js](../scripts/stress-tests/lib/helpers.js) — extend with new metric registrations
- [scripts/stress-tests/lib/payloads.js](../scripts/stress-tests/lib/payloads.js) — add `feedPayload`, `likePayload`, `streamUrlPayload`, `playlistPayload`
- [scripts/stress-tests/scenarios/run-all.js](../scripts/stress-tests/scenarios/run-all.js) — extend `scenarios` block to include new exec functions
- [Backend/src/routes/index.js](../../Backend/src/routes/index.js) — read-only reference for endpoint paths
- New: scenario files listed in §3.2
- New: `Testing/scripts/stress-tests/seed/seed-stress-data.js`
- New: `Testing/stress-tests/results/STRESS_TEST_REPORT.md` template

## Verification

1. **Each new scenario runs in isolation at smoke stage** — `k6 run --env STAGE=smoke --env ENV=local scenarios/feed.stress.js` returns 0 exit code with all checks passing.
2. **`run-all.js` smoke run includes every new scenario** — confirm all scenario tags appear in the K6 summary.
3. **Staging stress run completes without threshold breaches** — `npm run test:stress` exits 0; `results/summary.json` shows all thresholds in `pass` state.
4. **Breakpoint run identifies a ceiling** — at some VU step, http_req_failed > 1 % or p95 > 3 s. That step number gets recorded as the documented capacity.
5. **Soak run (4 h) shows flat memory profile on backend host** — captured via `docker stats` snapshots every 5 min during the run.
6. **`STRESS_TEST_REPORT.md` is produced and committed** with results from steps 3–5.

## Out of scope

- Frontend performance (Lighthouse, Web Vitals) — separate concern.
- Production environment runs.
- Distributed/multi-region load generation — single K6 runner is sufficient at this scale.
- Chaos engineering (kill-Redis-mid-test) — defer to a later phase if time permits.
