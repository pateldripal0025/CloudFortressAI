from datetime import timedelta
from fastapi import HTTPException, status
from app.core.security import verify_password, get_password_hash, create_access_token
from app.repositories.user_repository import user_repo
from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserLogin, Token

class AuthService:
    async def signup(self, user_in: UserCreate) -> User:
        existing_user = await user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )
        
        user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name
        )
        return await user_repo.create(user)

    async def login(self, user_in: UserLogin) -> Token:
        user = await user_repo.get_by_email(user_in.email)
        if not user or not verify_password(user_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        
        access_token = create_access_token(subject=user.email)
        return Token(access_token=access_token, token_type="Bearer")

auth_service = AuthService()
