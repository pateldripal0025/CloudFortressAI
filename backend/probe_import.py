import sys
import os
sys.path.append(os.getcwd())

try:
    print("--- Probing app.services.scan_service ---")
    import app.services.scan_service
    print(f"Module attributes: {dir(app.services.scan_service)}")
    from app.services.scan_service import scan_service
    print("Successfully imported scan_service")
except Exception as e:
    import traceback
    print(traceback.format_exc())
