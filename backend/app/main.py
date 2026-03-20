from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
import time
from app.api.v1 import api_v1_router
from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.redis import connect_to_redis, close_redis_connection
from app.api.v1.websocket_alerts import manager as ws_manager

app = FastAPI(title="CloudFortress AI API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "CloudFortress AI backend running"}

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

@app.on_event("startup")
async def startup_event():
    setup_logging()
    logger.info("application_startup")
    await connect_to_mongo()
    await connect_to_redis()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    await close_redis_connection()

# Include REST API Routers
app.include_router(api_v1_router, prefix="/api/v1")

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
