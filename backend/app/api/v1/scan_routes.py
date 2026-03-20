from fastapi import APIRouter, Depends
from typing import List, Optional
from app.schemas.scan_schema import ScanCreate, ScanResponse, RiskResponse
from app.services.scan_service import scan_service
from app.api.v1.deps import get_current_user
from app.models.user_model import User

router = APIRouter()

@router.post("/start")
async def start_scan(scan_in: ScanCreate, current_user: Optional[User] = Depends(get_current_user)):
    from app.core.logging import logger
    import traceback
    
    user_email = current_user.email if current_user else "test@example.com"
    logger.info("Scan started", user_email=user_email)
    try:
        result = await scan_service.start_scan(user_email, scan_in)
        return result
    except Exception as e:
        logger.error("scan_route_failed", error=str(e), traceback=traceback.format_exc())
        return {
            "status": "error",
            "message": "scan failed"
        }

@router.get("/history", response_model=List[ScanResponse])
async def get_history(current_user: User = Depends(get_current_user)):
    return await scan_service.get_history(current_user.email)

@router.get("/{scan_id}/risks", response_model=List[RiskResponse])
async def get_scan_risks(scan_id: str, current_user: User = Depends(get_current_user)):
    return await scan_service.get_scan_risks(scan_id)
