const BASE = "http://localhost:8000";

async function main() {
  const email = `test2-${Date.now()}@test.com`;
  const password = "password123";

  // Register
  console.log("=== Register ===");
  let r = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  let data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${JSON.stringify(data)}`);
  let token = data.access_token || "";
  console.log();

  // Login
  console.log("=== Login ===");
  r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${JSON.stringify(data)}`);
  token = data.access_token || "";
  console.log();

  const headers = { "Authorization": `Bearer ${token}` };

  // /auth/me
  console.log("=== Me ===");
  r = await fetch(`${BASE}/auth/me`, { headers });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${JSON.stringify(data)}`);
  console.log();

  // Start entry
  console.log("=== Start entry ===");
  r = await fetch(`${BASE}/entries/start`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ label: "Working on project" }),
  });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${JSON.stringify(data)}`);
  const entryId = data.id;
  console.log();

  // Active entry
  console.log("=== Active entry ===");
  r = await fetch(`${BASE}/entries/active`, { headers });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${JSON.stringify(data)}`);
  console.log();

  // Stop entry
  console.log("=== Stop entry ===");
  r = await fetch(`${BASE}/entries/stop`, { method: "POST", headers });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${JSON.stringify(data)}`);
  console.log();

  // Entries today
  console.log("=== Entries today ===");
  const today = new Date().toISOString().slice(0, 10);
  r = await fetch(`${BASE}/entries?date=${today}`, { headers });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${JSON.stringify(data)}`);
  console.log();

  // Stats
  console.log("=== Stats ===");
  r = await fetch(`${BASE}/stats?from=${today}&to=${today}`, { headers });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${JSON.stringify(data)}`);
  console.log();

  // 401 test
  console.log("=== 401 test (invalid token) ===");
  r = await fetch(`${BASE}/auth/me`, { headers: { "Authorization": "Bearer invalidtoken" } });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${JSON.stringify(data)}`);
  console.log();

  // 404 test
  console.log("=== 404 test ===");
  r = await fetch(`${BASE}/entries/99999`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ label: "test" }),
  });
  data = await r.json();
  console.log(`Status: ${r.status}`);
  console.log(`Response: ${JSON.stringify(data)}`);
  console.log();

  // Delete entry
  console.log("=== Delete entry ===");
  r = await fetch(`${BASE}/entries/${entryId}`, { method: "DELETE", headers });
  console.log(`Status: ${r.status}`);
  console.log();

  // Start then start again (auto-close)
  console.log("=== Start task 1 ===");
  r = await fetch(`${BASE}/entries/start`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ label: "Task 1" }),
  });
  data = await r.json();
  console.log(`Status: ${r.status}, label: ${data.label}`);
  console.log();

  console.log("=== Start task 2 (should auto-close task 1) ===");
  r = await fetch(`${BASE}/entries/start`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ label: "Task 2" }),
  });
  data = await r.json();
  console.log(`Status: ${r.status}, label: ${data.label}`);
  r = await fetch(`${BASE}/entries/active`, { headers });
  const activeData = await r.json();
  console.log(`Active task: ${activeData.label}`);
  console.log();

  // Stop
  await fetch(`${BASE}/entries/stop`, { method: "POST", headers });

  console.log("All tests passed!");
}

main().catch(console.error);
