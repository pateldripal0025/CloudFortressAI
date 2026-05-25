from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import Optional

class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = "mongodb://127.0.0.1:27017"
    DATABASE_URL: Optional[str] = None
    DB_NAME: str = "cloudfortress_ai"

    # JWT Security
    JWT_SECRET: str = "secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    WEBHOOK_SECRET: str = "cf_webhook_secure_token_2026"

    # Redis
    REDIS_URL: str = "redis://127.0.0.1:6379/0"

    # Environment
    ENV: str = "development"
    LOG_LEVEL: str = "info"
    FRONTEND_URL: Optional[str] = None

    # CORS Configuration (Production Origins)
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://cloudfortress.ai",
        "https://admin.cloudfortress.ai",
        "https://cloud-fortress-ai.vercel.app"
    ]

    @model_validator(mode="after")
    def resolve_configs(self) -> 'Settings':
        if self.DATABASE_URL:
            self.MONGODB_URI = self.DATABASE_URL
        if self.FRONTEND_URL and self.FRONTEND_URL not in self.ALLOWED_ORIGINS:
            self.ALLOWED_ORIGINS.append(self.FRONTEND_URL)
        return self

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
