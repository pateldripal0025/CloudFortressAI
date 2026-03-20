from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logging import logger

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def connect_to_mongo():
    logger.info("connecting_to_mongodb", uri=settings.MONGODB_URI)
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db.db = db.client[settings.DB_NAME]
    logger.info("connected_to_mongodb", database=settings.DB_NAME)

async def close_mongo_connection():
    logger.info("closing_mongodb_connection")
    db.client.close()
    logger.info("closed_mongodb_connection")

async def get_database():
    return db.db
