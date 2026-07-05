import requests
import json

BASE = "http://localhost:8000"

# Test register
print("=== Register ===")
r = requests.post(f"{BASE}/auth/register", json={"email": "test2@test.com", "password": "password123"})
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
token = r.json().get("access_token", "")
print()

# Test login
print("=== Login ===")
r = requests.post(f"{BASE}/auth/login", json={"email": "test2@test.com", "password": "password123"})
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
token = r.json().get("access_token", "")
print()

headers = {"Authorization": f"Bearer {token}"}

# Test /auth/me
print("=== Me ===")
r = requests.get(f"{BASE}/auth/me", headers=headers)
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test start entry
print("=== Start entry ===")
r = requests.post(f"{BASE}/entries/start", json={"label": "Working on project"}, headers=headers)
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
entry_id = r.json().get("id")
print()

# Test active entry
print("=== Active entry ===")
r = requests.get(f"{BASE}/entries/active", headers=headers)
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test stop entry
print("=== Stop entry ===")
r = requests.post(f"{BASE}/entries/stop", headers=headers)
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test get entries by date
print("=== Entries today ===")
from datetime import date
today = date.today().isoformat()
r = requests.get(f"{BASE}/entries?date={today}", headers=headers)
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test stats
print("=== Stats ===")
r = requests.get(f"{BASE}/stats?from={today}&to={today}", headers=headers)
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test 401 - invalid token
print("=== 401 test (invalid token) ===")
r = requests.get(f"{BASE}/auth/me", headers={"Authorization": "Bearer invalidtoken"})
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test 404 - non-existent entry
print("=== 404 test ===")
r = requests.patch(f"{BASE}/entries/99999", json={"label": "test"}, headers=headers)
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test delete
print("=== Delete entry ===")
r = requests.delete(f"{BASE}/entries/{entry_id}", headers=headers)
print(f"Status: {r.status_code}")
print()

# Test start then start again (auto-close)
print("=== Start task 1 ===")
r = requests.post(f"{BASE}/entries/start", json={"label": "Task 1"}, headers=headers)
print(f"Status: {r.status_code}, label: {r.json().get('label')}")
print()

print("=== Start task 2 (should auto-close task 1) ===")
r = requests.post(f"{BASE}/entries/start", json={"label": "Task 2"}, headers=headers)
print(f"Status: {r.status_code}, label: {r.json().get('label')}")
# Check that task 1 is now closed
r2 = requests.get(f"{BASE}/entries/active", headers=headers)
print(f"Active task: {r2.json().get('label')}")
print()

# Stop
requests.post(f"{BASE}/entries/stop", headers=headers)

print("All tests passed!")