from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback
import time
import asyncio
from app.api.v1 import api_v1_router
from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.redis import connect_to_redis, close_redis_connection
from app.api.v1.websocket_alerts import manager as ws_manager

app = FastAPI(title="CloudFortress AI API")

# Setup CORS with secure production allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Robust Production Health Check Probes
@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    # Check MongoDB status
    mongo_status = "DOWN"
    try:
        from app.database.mongodb import db
        if db.db is not None:
            await db.db.command("ping")
            mongo_status = "UP"
    except Exception as e:
        logger.error("health_check_mongo_failed", error=str(e))

    # Check Redis status
    redis_status = "DOWN"
    try:
        from app.database.redis import redis_client
        if redis_client.client is not None:
            await redis_client.client.ping()
            redis_status = "UP"
    except Exception as e:
        logger.error("health_check_redis_failed", error=str(e))

    status_code = 200 if mongo_status == "UP" and redis_status == "UP" else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "HEALTHY" if status_code == 200 else "DEGRADED",
            "timestamp": time.time(),
            "services": {
                "mongodb": mongo_status,
                "redis": redis_status
            }
        }
    )

# Exception Handlers for Structured Production Responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.error("http_exception", path=request.url.path, status_code=exc.status_code, detail=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "detail": exc.detail, "code": "HTTP_ERROR"}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error("validation_error", path=request.url.path, errors=exc.errors())
    return JSONResponse(
        status_code=422,
        content={
            "success": False, 
            "detail": "Validation error", 
            "errors": exc.errors(),
            "code": "VALIDATION_ERROR"
        }
    )

@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    # WebSocket upgrade requests must not be processed by HTTP middleware
    if request.headers.get("upgrade", "").lower() == "websocket":
        return await call_next(request)

    start_time = time.time()
    auth_header = request.headers.get("Authorization")
    logger.info("request_started", path=request.url.path, method=request.method, has_auth=bool(auth_header))
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(
            "request_finished", 
            path=request.url.path, 
            method=request.method, 
            status_code=response.status_code,
            duration=f"{process_time:.4f}s"
        )
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            "request_failed", 
            path=request.url.path, 
            method=request.method, 
            error=str(e),
            traceback=traceback.format_exc(),
            duration=f"{process_time:.4f}s"
        )
        return JSONResponse(
            status_code=500, 
            content={"detail": "Internal Server Error", "error": str(e)}
        )

# Concurrent & Optimized Startup Events
@app.on_event("startup")
async def startup_event():
    setup_logging()
    logger.info("application_startup_initiating")
    # Concurrently establish MongoDB and Redis connections to optimize startup time
    await asyncio.gather(
        connect_to_mongo(),
        connect_to_redis()
    )
    logger.info("application_startup_complete")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    await close_redis_connection()

# Include REST API Routers
app.include_router(api_v1_router, prefix="/api/v1")
app.include_router(api_v1_router, prefix="/api")

# WebSocket endpoint registered at app level
@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "Welcome to CloudFortress AI API"}
