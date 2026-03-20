import httpx
import json
import time

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = f"test_{int(time.time())}@user.com"
PASSWORD = "password"

def verify():
    with httpx.Client(base_url=BASE_URL, timeout=10) as client:
        print(f"--- 1. Signing up user {EMAIL} ---")
        signup_res = client.post("/auth/signup", json={
            "email": EMAIL,
            "password": PASSWORD,
            "fullName": "Test Verification User"
        })
        print(f"Signup Status: {signup_res.status_code}")
        if signup_res.status_code != 201:
            print(f"Error: {signup_res.text}")
            return

        print("--- 2. Logging in ---")
        login_res = client.post("/auth/login", json={
            "email": EMAIL,
            "password": PASSWORD
        })
        print(f"Login Status: {login_res.status_code}")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        print("--- 3. Starting Global Scan ---")
        scan_res = client.post("/scans/start", json={"provider": "AWS"}, headers=headers)
        print(f"Scan Status: {scan_res.status_code}")
        print(f"Scan Result: {scan_res.json()}")

        print("--- 4. Verifying Risks API ---")
        risks_res = client.get("/risks", headers=headers)
        print(f"Risks Status: {risks_res.status_code}")
        risks = risks_res.json()
        print(f"Found {len(risks)} risks")
        
        if len(risks) > 0:
            first = risks[0]
            print("\nSample Risk Record Verification:")
            fields_to_check = ['resource_id', 'resource_type', 'title', 'category', 'risk_score', 'ai_explanation', 'remediation_steps', 'ai_recommendation']
            for f in fields_to_check:
                print(f"{f}: {first.get(f) is not None} (Value: {str(first.get(f))[:50]}...)")

        print("\n--- 5. Verifying Dashboard Summary ---")
        summary_res = client.get("/dashboard/summary", headers=headers)
        print(f"Summary Status: {summary_res.status_code}")
        print(f"Summary: {summary_res.json()}")

if __name__ == "__main__":
    verify()
