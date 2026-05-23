from app.core.config import settings
print(f"MONGODB_URI: {settings.MONGODB_URI}")
print(f"DB_NAME: {settings.DB_NAME}")
print(f"REDIS_URL: {settings.REDIS_URL}")
print("Settings loaded successfully")
