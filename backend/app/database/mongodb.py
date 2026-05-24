import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logging import logger

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

def _escape_mongodb_uri(uri: str) -> str:
    if not uri:
        return uri
    if not (uri.startswith("mongodb://") or uri.startswith("mongodb+srv://")):
        return uri
    try:
        scheme_split = uri.split("://", 1)
        scheme = scheme_split[0]
        rest = scheme_split[1]
        
        if "?" in rest:
            rest_without_query, query = rest.split("?", 1)
            query_suffix = "?" + query
        else:
            rest_without_query = rest
            query_suffix = ""
            
        if "@" in rest_without_query:
            credentials, host_path = rest_without_query.rsplit("@", 1)
            if ":" in credentials:
                username, password = credentials.split(":", 1)
                username_escaped = urllib.parse.quote_plus(urllib.parse.unquote(username))
                password_escaped = urllib.parse.quote_plus(urllib.parse.unquote(password))
                escaped_credentials = f"{username_escaped}:{password_escaped}"
            else:
                escaped_credentials = urllib.parse.quote_plus(urllib.parse.unquote(credentials))
            return f"{scheme}://{escaped_credentials}@{host_path}{query_suffix}"
    except Exception as e:
        logger.error("error_escaping_mongodb_uri", error=str(e))
    return uri

async def connect_to_mongo():
    escaped_uri = _escape_mongodb_uri(settings.MONGODB_URI)
    # Mask username and password in logs to avoid leaking credentials
    masked_uri = settings.MONGODB_URI
    if "@" in masked_uri:
        try:
            scheme_split = masked_uri.split("://", 1)
            rest = scheme_split[1]
            credentials, host_path = rest.rsplit("@", 1)
            masked_uri = f"{scheme_split[0]}://****:****@{host_path}"
        except Exception:
            masked_uri = "mongodb://****:****@hidden"
            
    logger.info("connecting_to_mongodb", uri=masked_uri)
    db.client = AsyncIOMotorClient(escaped_uri)
    db.db = db.client[settings.DB_NAME]
    logger.info("connected_to_mongodb", database=settings.DB_NAME)

async def close_mongo_connection():
    logger.info("closing_mongodb_connection")
    if db.client:
        db.client.close()
    logger.info("closed_mongodb_connection")

async def get_database():
    return db.db
