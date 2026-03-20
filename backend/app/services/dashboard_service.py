from app.repositories.risk_repository import risk_repo
from app.repositories.scan_repository import scan_repo
from app.schemas.scan_schema import DashboardSummary

class DashboardService:
    async def get_summary(self, user_id: str) -> DashboardSummary:
        from app.core.logging import logger
        logger.info("fetching_dashboard_summary", user_id=user_id)
        
        risk_counts = await risk_repo.get_summary(user_id)
        scans = await scan_repo.get_by_user(user_id)
        
        total_resources = sum(s.total_resources for s in scans) if scans else 0
        total_risks = sum(risk_counts.values())
        
        return DashboardSummary(
            total_resources=total_resources,
            total_risks=total_risks,
            critical_risks=risk_counts.get("critical", 0),
            high_risks=risk_counts.get("high", 0),
            medium_risks=risk_counts.get("medium", 0),
            low_risks=risk_counts.get("low", 0)
        )

dashboard_service = DashboardService()
