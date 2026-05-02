// Verifies that the 5 pre-existing stress-test users can log in against the
// deployed VM. Run once before a stress-test session to confirm credentials.
//
// Usage:
//   node seed-stress-data.js
//   K6_BASE_URL=https://pulsify.page/api/v1 node seed-stress-data.js

const BASE_URL = process.env.K6_BASE_URL || 'https://pulsify.page/api/v1';

const TEST_USERS = [
    'stresstester1@gmail.com',
    'stresstester2@gmail.com',
    'stresstester3@gmail.com',
    'stresstester4@gmail.com',
    'stresstester5@gmail.com',
];
const PASSWORD = 'password123';

async function login(email) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: PASSWORD }),
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* not json */ }
    const token = json?.access_token || json?.accessToken
        || json?.data?.access_token || json?.data?.accessToken || json?.token;
    return { status: res.status, token: token || null, body: text.slice(0, 200) };
}

async function main() {
    console.log(`[verify] Target: ${BASE_URL}`);
    console.log(`[verify] Checking ${TEST_USERS.length} stress-test users…\n`);

    let passed = 0;
    for (const email of TEST_USERS) {
        const { status, token, body } = await login(email);
        if (token) {
            console.log(`  ✓  ${email}  →  token obtained (status ${status})`);
            passed++;
        } else {
            console.error(`  ✗  ${email}  →  FAILED status=${status}  body=${body}`);
        }
    }

    console.log(`\n[verify] ${passed}/${TEST_USERS.length} users verified.`);
    if (passed < TEST_USERS.length) {
        console.error('[verify] Some users could not log in — fix before running k6.');
        process.exit(1);
    }
    console.log('[verify] All users OK. Ready to run stress tests.');
}

main().catch((err) => {
    console.error('[verify] FATAL:', err.message);
    process.exit(1);
});
