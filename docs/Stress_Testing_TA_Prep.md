# Pulsify Stress Testing — TA Discussion Guide

This document serves as a revision guide and presentation script for discussing the Pulsify Stress Testing phase with project stakeholders or Teaching Assistants.

---

## Level 0: The Fundamentals
**What is Stress Testing?**
If load testing is driving the expected amount of traffic over a bridge to ensure it holds, **stress testing is driving a 100-ton freight train over it to see exactly how and when it breaks.** The goal is not to prove the system is indestructible, but to observe its degradation.

**The 6 Types of Tests We Used:**
1. **Smoke:** 1–2 users for 1 min. *Does the system work at all?*
2. **Load:** 50 users. *Does it meet SLAs under our expected normal peak traffic?*
3. **Stress:** 500 users. *Does it stay healthy when overloaded?*
4. **Spike:** 0 → 1000 users in 10s. *Can it absorb a viral surge?*
5. **Soak:** 100 users for 4 hours. *Does it leak memory over time?* (Skipped due to saturation).
6. **Breakpoint:** Ramping up until failure. *At what exact load does it fall over?*

**Pulsify's NFRs (Non-Functional Requirements):**
* **Global Latency:** p95 < 1.5s, p99 < 3s
* **Error Rate:** < 1%
* **Scale:** Up to 1000+ concurrent users

---

## Level 1: Simulation (How k6 Works)
We cannot hire 1,000 humans, so we use **k6** to generate **Virtual Users (VUs)**. A VU is a lightweight JavaScript process that mimics a human's "flow" (login → wait → search → wait).

**Key Script Components:**
* **Options:** Defines the ramp-up stages and the thresholds (NFRs).
* **Setup:** Runs once to grab shared tokens and prepare test data.
* **Default Function:** The main loop the VU repeats (e.g., the user journey).
* **Metrics:** Trackers (`Rate`, `Trend`, `Counter`) acting as our scoreboard.

**Avoiding Test Traps:**
We randomize data (using `SEEDED_TRACK_IDS` and rotating `TEST_USERS`) to ensure we are testing the actual server processing power, rather than accidentally testing the database's caching layer.

---

## Level 2: Interpreting "Failure"
In stress testing, **a failed test is high-quality data.** When our stress test failed with a 96% error rate, the *testing team* didn't fail—we successfully located the breaking point.

**How to Read the Scoreboard:**
* **p95 / p99 Percentiles:** p95 = 800ms means 95% of users had an experience under 800ms. We use percentiles because averages hide the extremes.
* **The "Wall":** Latency jumped from ~800ms (Smoke) to ~20,000ms (Stress). This proves resource starvation (the CPU is too busy to answer requests).

---

## Level 3: Seeding (The Preparation Phase)
We must run a seed script (`seed-stress-data.js`) before testing. 

* **Why?** Testing an empty database is an illusion. We need realistic data to create index pressure.
* **Referential Integrity:** If our script tells a VU to "like" a track, that track must exist in the database first.
* **The Anti-Pattern:** Never generate test data *during* the test. That tests your database's *insertion* speed, not its *read/query* speed under load.

---

## Level 4: The Art of the Bottleneck
When a system fails under load, we must find the "Single Lane" blocking the highway. 

**The Three Suspects:**
1. **CPU:** Heavy math (hashing passwords, processing images).
2. **I/O:** Waiting on the Database or external APIs.
3. **RAM:** Memory leaks leading to disk swapping.

**Our Diagnosis (The Pulsify Bottleneck):**
Through **Isolation Strategy** (running scenarios individually), we found the exact bottleneck. The Node.js **Event Loop** is single-threaded. Because the backend uses synchronous `bcryptjs` hashing with a cost factor of 12, every login blocks the entire server for ~350ms. At 50+ users, the server completely freezes, causing simple reads like `/search` to timeout.

---

## Level 5: The TA Discussion / Developer Hand-off

When presenting the `STRESS_TEST_REPORT.md` to the TA or Backend Team, use the **BLUF** (Bottom Line Up Front) approach.

### The 30-Second Elevator Pitch (Memorize This)
> *"We've completed the Pulsify stress test suite. The bottom line is that the system currently has a hard capacity ceiling at approximately 50 concurrent users. We proved this by running scenarios from Smoke tests up to 1200-user Breakpoint tests. We identified that the `bcrypt` authentication logic is the primary bottleneck—because it's synchronous, it blocks the Node.js event loop, causing a cascading timeout failure across all endpoints. We’ve documented all of this in the report, assigned the critical action item to the backend team, and skipped the 4-hour Soak test because running it on a saturated system would only yield 4 hours of timeouts."*

### Report Talking Points:
1. **The Action Items Table:** Point to Item #10. Emphasize that we didn't just report "it's slow"; we did a code review, found the exact library (`bcryptjs`), and suggested the fix (reduce salt rounds to 10 or make it async).
2. **Sign-off Integrity:** Explain why "All NFRs passed" is marked as FAILED. Professional testers don't hide bad data; we highlight it so it can be fixed before production.
