import asyncio, traceback
import sys
import os

# Ensure app is in path
sys.path.append(os.getcwd())

from app.database.mongodb import connect_to_mongo
from app.schemas.scan_schema import ScanCreate
from app.repositories.risk_repository import risk_repo

async def test():
    try:
        await connect_to_mongo()
        print("--- Importing ScanService ---")
        from app.services.scan_service import ScanService, scan_service
        
        print("--- Starting Test Scan ---")
        scan_in = ScanCreate(provider="AWS")
        result = await scan_service.start_scan("test@user.com", scan_in)
        print(f"Result: {result}")
        
        print("\n--- Verifying MongoDB Records ---")
        risks = await risk_repo.get_by_user("test@user.com")
        for risk in risks:
            print(f"\nResource: {risk.get('resource_id')}")
            print(f"Title: {risk.get('title')}")
            print(f"Category: {risk.get('category')}")
            print(f"Score: {risk.get('risk_score')}")
            print(f"Cluster: {risk.get('risk_cluster')}")
            print(f"AI Explanation: {risk.get('ai_explanation', '')[:50]}...")
            
    except Exception as e:
        print(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(test())
