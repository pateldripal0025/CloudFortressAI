from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = "mongodb://127.0.0.1:27017"
    DB_NAME: str = "cloudfortress_ai"

    # JWT Security
    JWT_SECRET: str = "secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Redis
    REDIS_URL: str = "redis://127.0.0.1:6379/0"

    # Environment
    ENV: str = "development"
    LOG_LEVEL: str = "info"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
