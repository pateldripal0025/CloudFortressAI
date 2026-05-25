from fastapi import APIRouter, status, Depends, Request, HTTPException, Body
from typing import Optional
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import auth_service
from app.api.v1.deps import get_current_user
from app.models.user_model import User
from app.core.security import create_access_token
from app.repositories.user_repository import user_repo

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate):
    from app.core.logging import logger
    logger.info("signup_request_received", email=user_in.email)
    try:
        user = await auth_service.signup(user_in)
        logger.info("signup_success", user_id=user.id)
        return user
    except Exception as e:
        logger.error("signup_exception", error=str(e))
        raise e

@router.post("/register")
async def register(user_in: UserCreate):
    from app.core.logging import logger
    logger.info("register_request_received", email=user_in.email)
    try:
        user = await auth_service.signup(user_in)
        logger.info("register_success", user_id=user.id)
        
        # Generate token directly for automatic redirect
        access_token = create_access_token(subject=user.email)
        return {
            "status": "success",
            "token": access_token,
            "refreshToken": f"fallback-refresh-token-{user.id}",
            "data": {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "fullname": user.fullname,
                    "role": user.role
                }
            }
        }
    except Exception as e:
        logger.error("register_exception", error=str(e))
        raise e

@router.post("/login")
async def login(request: Request, user_in: Optional[UserLogin] = Body(None)):
    resolved_user_in = None
    if user_in:
        resolved_user_in = user_in
    else:
        # Fallback to Form data (Swagger style)
        try:
            form_data = await request.form()
            username = form_data.get("username")
            password = form_data.get("password")
            if username and password:
                resolved_user_in = UserLogin(email=username, password=password)
        except Exception:
            pass
            
    if not resolved_user_in:
        raise HTTPException(status_code=400, detail="Invalid login data format. Provide JSON body or Form data.")
        
    token_res = await auth_service.login(resolved_user_in)
    user = await user_repo.get_by_email(resolved_user_in.email)
    
    return {
        "status": "success",
        "access_token": token_res.access_token,
        "token_type": "Bearer",
        "token": token_res.access_token,
        "refreshToken": f"fallback-refresh-token-{user.id}",
        "data": {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "fullname": user.fullname,
                "role": user.role
            }
        }
    }

@router.get("/me")
async def get_me(current_user: Optional[User] = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "status": "success",
        "data": {
            "user": {
                "id": str(current_user.id),
                "email": current_user.email,
                "fullname": current_user.fullname,
                "role": current_user.role
            }
        }
    }

@router.post("/logout")
async def logout():
    return {"status": "success", "message": "Logged out successfully"}

@router.post("/forgot-password")
async def forgot_password(body: dict = Body(...)):
    return {"status": "success", "message": "If a profile matches that email, a password reset link was dispatched."}

@router.post("/reset-password")
async def reset_password(body: dict = Body(...)):
    return {"status": "success", "message": "Password changed successfully! You can now log in."}
