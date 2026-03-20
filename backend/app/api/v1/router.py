from fastapi import APIRouter
from app.api.v1.deps import get_current_user

from app.api.v1.auth_routes import router as auth_router
from app.api.v1.dashboard_routes import router as dashboard_router
from app.api.v1.scan_routes import router as scan_router
from app.api.v1.websocket_alerts import router as websocket_router
from app.api.v1.risks_routes import router as risks_router
from app.api.v1.ai_routes import router as ai_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_v1_router.include_router(scan_router, prefix="/scans", tags=["Scans"])
api_v1_router.include_router(risks_router, prefix="/risks", tags=["Risks"])
api_v1_router.include_router(ai_router, prefix="/ai", tags=["AI"])
api_v1_router.include_router(websocket_router, tags=["WebSockets"])
