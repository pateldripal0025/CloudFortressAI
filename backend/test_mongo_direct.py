import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def test_mongo():
    print(f"Connecting to {settings.MONGODB_URI}...")
    client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
    try:
        await client.admin.command('ping')
        print("MongoDB connection successful!")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_mongo())
