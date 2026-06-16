import httpx
import json
import sys

def print_header():
    print("====================================================================")
    print("  🛡️  CloudFortress AI: Real-Time Event Processor Control Suite")
    print("====================================================================")
    print()

def simulate_alert(choice: int):
    print("Select target environment:")
    print("  [1] Local Development (localhost:8000)")
    print("  [2] Production (cloudfortressai-production.up.railway.app)")
    try:
        env_val = input("Enter environment choice (1-2) [Default 1]: ").strip()
        env_choice = int(env_val) if env_val else 1
    except (KeyboardInterrupt, ValueError):
        env_choice = 1

    if env_choice == 2:
        base_url = "https://cloudfortressai-production.up.railway.app"
    else:
        base_url = "http://localhost:8000"

    url = f"{base_url}/api/v1/realtime/event"
    telemetry_url = f"{base_url}/api/v1/realtime/telemetry"
    secret = "cf_webhook_secure_token_2026"
    
    headers = {
        "X-CloudFortress-Signature": secret,
        "Content-Type": "application/json"
    }

    event_payload = {
        "event_source": "aws.s3",
        "event_name": "CreateBucket",
        "provider": "AWS",
        "resource_id": "prod-customer-financials-2026",
        "resource_type": "AWS::S3::Bucket",
        "user_identity": "arn:aws:iam::123456789012:user/temp-developer"
    }

    if choice == 1:
        print("[1/2] Injecting Authorized & Valid Real-time Event...")
        try:
            response = httpx.post(url, json=event_payload, headers=headers, timeout=5.0)
            print(f"  [STATUS] {response.status_code}")
            print(f"  [RESPONSE] {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"  [ERROR] Connection failed: {e}")

    elif choice == 2:
        print("[1/2] Injecting duplicate events to trigger Idempotency Engine...")
        try:
            print("  -> Sending Event 1...")
            res1 = httpx.post(url, json=event_payload, headers=headers, timeout=5.0)
            print(f"     Status: {res1.status_code} | Response: {res1.json().get('status')}")
            
            print("  -> Sending Duplicate Event 2 (identical footprint)...")
            res2 = httpx.post(url, json=event_payload, headers=headers, timeout=5.0)
            print(f"     Status: {res2.status_code} | Response: {res2.json().get('status')}")
            print(f"     Details: {json.dumps(res2.json(), indent=2)}")
        except Exception as e:
            print(f"  [ERROR] Idempotency test failed: {e}")

    elif choice == 3:
        print("[1/2] Injecting event with missing/invalid signature...")
        bad_headers = headers.copy()
        bad_headers["X-CloudFortress-Signature"] = "invalid_token_xyz"
        try:
            response = httpx.post(url, json=event_payload, headers=bad_headers, timeout=5.0)
            print(f"  [STATUS] {response.status_code} (Expect 401 Unauthorized)")
            print(f"  [RESPONSE] {response.text}")
        except Exception as e:
            print(f"  [ERROR] Signature security test failed: {e}")

    elif choice == 4:
        print("[1/2] Injecting malformed event (violating Pydantic schema)...")
        malformed_payload = event_payload.copy()
        malformed_payload["provider"] = "INVALID_CLOUD"  # Must be AWS, Azure, GCP
        try:
            response = httpx.post(url, json=malformed_payload, headers=headers, timeout=5.0)
            print(f"  [STATUS] {response.status_code} (Expect 422 Unprocessable Entity)")
            print(f"  [RESPONSE] {response.text}")
        except Exception as e:
            print(f"  [ERROR] Schema verification test failed: {e}")

    elif choice == 5:
        print("[1/2] Fetching live event processor performance telemetry...")
        try:
            response = httpx.get(telemetry_url, timeout=5.0)
            print(f"  [STATUS] {response.status_code}")
            print(f"  [TELEMETRY METRICS]")
            print(json.dumps(response.json(), indent=2))
        except Exception as e:
            print(f"  [ERROR] Telemetry capture failed: {e}")

    print()
    print("====================================================================")

if __name__ == "__main__":
    print_header()
    print("Select a simulation vector to execute:")
    print("  [1] Send Authorized & Signed Real-time Event")
    print("  [2] Test Idempotency Engine (Duplicate Event Storm)")
    print("  [3] Test Signature Security Rejection (Invalid Signature)")
    print("  [4] Test Schema Verification Rejection (Malformed Payload)")
    print("  [5] Fetch Event Processor Live Telemetry Dashboard")
    print()
    
    try:
        val = input("Enter choice (1-5) [Default 1]: ").strip()
        choice = int(val) if val else 1
        if choice not in range(1, 6):
            print("Invalid selection. Bypassing.")
            sys.exit(0)
    except KeyboardInterrupt:
        print("\nAborted.")
        sys.exit(0)
    except ValueError:
        choice = 1

    simulate_alert(choice)
