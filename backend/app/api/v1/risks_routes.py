from fastapi import APIRouter, Depends
from typing import List, Optional
from app.api.v1.deps import get_current_user
from app.models.user_model import User
from app.repositories.risk_repository import risk_repo
from app.models.risk_model import Risk

router = APIRouter()

@router.get("")
async def get_all_risks(current_user: Optional[User] = Depends(get_current_user)):
    """
    Retrieves all risks for the current user.
    """
    user_email = current_user.email if current_user else "test@example.com"
    return await risk_repo.get_by_user(user_email)
