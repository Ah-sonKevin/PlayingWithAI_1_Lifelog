const BASE = "http://localhost:8000/api";

async function main() {
  // Register (may fail if already exists)
  const reg = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.com", password: "test123" }),
  });
  const regData = await reg.json();
  console.log("Register:", reg.status, JSON.stringify(regData));

  // Login
  const login = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.com", password: "test123" }),
  });
  const loginData = await login.json();
  console.log("Login:", login.status, JSON.stringify(loginData));
  const token = loginData.access_token;

  // Start entry
  const start = await fetch(`${BASE}/entries/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ label: "coding" }),
  });
  const startData = await start.json();
  console.log("Start:", start.status, JSON.stringify(startData));

  // Stop entry
  const stop = await fetch(`${BASE}/entries/stop`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
  });
  const stopData = await stop.json();
  console.log("Stop:", stop.status, JSON.stringify(stopData));

  // Get entries by date
  const today = new Date().toISOString().slice(0, 10);
  const entries = await fetch(`${BASE}/entries?date=${today}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const entriesData = await entries.json();
  console.log("Entries:", entries.status, JSON.stringify(entriesData));

  // Get stats
  const stats = await fetch(`${BASE}/stats?from=${today}&to=${today}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const statsData = await stats.json();
  console.log("Stats:", stats.status, JSON.stringify(statsData));
}

main().catch(console.error);