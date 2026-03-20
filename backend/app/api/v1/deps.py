from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.schemas.user_schema import TokenData
from app.repositories.user_repository import user_repo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    from app.core.logging import logger
    if not token:
        return None
        
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            logger.error("auth_failed_no_email_in_payload")
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError as e:
        logger.error("auth_failed_jwt_error", error=str(e))
        raise credentials_exception
    
    user = await user_repo.get_by_email(token_data.email)
    if user is None:
        logger.error("auth_failed_user_not_found", email=token_data.email)
        raise credentials_exception
    return user
