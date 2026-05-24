from fastapi import APIRouter, status, Depends, Request, HTTPException, Body
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
async def login(request: Request, user_in: Optional[UserLogin] = Body(None)):
    # Try using JSON body parsed by FastAPI/Pydantic
    if user_in:
        return await auth_service.login(user_in)
    
    # Fallback to Form data (Swagger OAuth2 style)
    try:
        form_data = await request.form()
        username = form_data.get("username")
        password = form_data.get("password")
        if username and password:
            user_in = UserLogin(email=username, password=password)
            return await auth_service.login(user_in)
    except Exception:
        pass
        
    raise HTTPException(status_code=400, detail="Invalid login data format. Provide JSON body or Form data.")
