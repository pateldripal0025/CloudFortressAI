from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.repositories.notification_repository import notification_repo
from app.api.v1.deps import get_current_user
from app.models.user_model import User
from typing import Optional

router = APIRouter()

@router.get("")
async def get_notifications(current_user: Optional[User] = Depends(get_current_user)):
    """
    Retrieves latest notifications.
    """
    notifications = await notification_repo.get_all()
    unread_count = await notification_repo.get_unread_count()
    
    return {
        "success": True,
        "data": notifications,
        "unreadCount": unread_count
    }

@router.put("/{id}/read")
async def mark_as_read(id: str, current_user: Optional[User] = Depends(get_current_user)):
    """
    Marks a notification as read.
    """
    success = await notification_repo.mark_as_read(id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return {"success": True}

@router.delete("/clear")
async def clear_notifications(current_user: Optional[User] = Depends(get_current_user)):
    """
    Clears all notifications.
    """
    await notification_repo.clear_all()
    return {"success": True}
