from fastapi import APIRouter
from . import auth_routes, dashboard_routes, scan_routes, risks_routes, ai_routes, websocket_alerts

api_v1_router = APIRouter()

api_v1_router.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(dashboard_routes.router, prefix="/dashboard", tags=["Dashboard"])
api_v1_router.include_router(scan_routes.router, prefix="/scans", tags=["Scans"])
api_v1_router.include_router(risks_routes.router, prefix="/risks", tags=["Risks"])
api_v1_router.include_router(ai_routes.router, prefix="/ai", tags=["AI"])
api_v1_router.include_router(websocket_alerts.router, tags=["WebSockets"])
