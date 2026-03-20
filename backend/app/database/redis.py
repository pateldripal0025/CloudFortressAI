import redis.asyncio as redis
from app.core.config import settings
from app.core.logging import logger

class RedisClient:
    client: redis.Redis = None

redis_client = RedisClient()

async def connect_to_redis():
    logger.info("connecting_to_redis", url=settings.REDIS_URL)
    redis_client.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        await redis_client.client.ping()
        logger.info("connected_to_redis")
    except Exception as e:
        logger.error("redis_connection_failed", error=str(e))

async def close_redis_connection():
    logger.info("closing_redis_connection")
    if redis_client.client:
        await redis_client.client.close()
    logger.info("closed_redis_connection")

async def get_redis():
    return redis_client.client
