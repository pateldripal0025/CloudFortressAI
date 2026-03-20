from fastapi import APIRouter, Depends
from typing import Optional
from app.schemas.scan_schema import DashboardSummary
from app.services.dashboard_service import dashboard_service
from app.api.v1.deps import get_current_user
from app.models.user_model import User

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
async def get_summary(current_user: User = Depends(get_current_user)):
    # Fallback for development if auth fails or is skipped
    user_email = current_user.email if current_user else "test@example.com"
    return await dashboard_service.get_summary(user_email)
