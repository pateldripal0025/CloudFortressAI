from fastapi import APIRouter, status, Depends, Request, HTTPException
from typing import Optional
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import auth_service

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate):
    from app.core.logging import logger
    logger.info("signup_request_received", email=user_in.email)
    try:
        user = await auth_service.signup(user_in)
        logger.info("signup_success", user_id=user.id, user_obj=user.model_dump())
        return user
    except Exception as e:
        logger.error("signup_exception", error=str(e))
        raise e

@router.post("/login", response_model=Token)
async def login(request: Request):
    # Try to parse as JSON first (Postman/Frontend style)
    try:
        body = await request.json()
        user_in = UserLogin(**body)
    except Exception:
        # Fallback to Form data (Swagger style)
        try:
            form_data = await request.form()
            user_in = UserLogin(email=form_data.get("username"), password=form_data.get("password"))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid login data format")
    
    return await auth_service.login(user_in)
