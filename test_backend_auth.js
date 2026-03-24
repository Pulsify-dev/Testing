async function testAuth() {
  console.log("=== Testing Backend Auth (Approach 1) ===");

  const testUser = {
    email: `test_${Date.now()}@example.com`,
    username: `usr_${String(Date.now()).substring(7)}`,
    password: "Password123!",
    captcha_token: "dummy_token"
  };

  console.log("\n1. Registering new test user:", testUser.email);
  try {
    const regRes = await fetch("http://localhost:3000/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });
    
    // Some APIs might return empty bodies or not true JSON on error, handling gracefully
    let regData;
    const regText = await regRes.text();
    try { regData = JSON.parse(regText); } catch(e) { regData = regText; }

    console.log("Register Response:", regRes.status, regData);

    if (regRes.status !== 201) {
      console.log("❌ Registration failed. Cannot proceed to login test.");
      return;
    }

    console.log("\n✅ Registration successful!");

    console.log("\n2. Logging in with test user...");
    const loginRes = await fetch("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });

    let loginData;
    const loginText = await loginRes.text();
    try { loginData = JSON.parse(loginText); } catch(e) { loginData = loginText; }
    
    console.log("Login Response Status:", loginRes.status);
    
    // Check for tokens in typical places (accessToken, token, token data nesting)
    const token = loginData.accessToken || loginData.token || (loginData.data && loginData.data.accessToken) || loginData.refresh_token;

    if (loginRes.status === 200 && token) {
      console.log("\n✅ SUCCESS! Backend returned a valid JWT access token.");
      console.log("Token sample:", token.substring(0, 30) + "...");
    } else {
      console.log("\n❌ FAILED. No valid access token returned or wrong status.", loginData);
    }
  } catch (error) {
    console.log("\n❌ EXCEPTION: Attempting to connect to the backend failed.", error.message);
  }
}
testAuth();
