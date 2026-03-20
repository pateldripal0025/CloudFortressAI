from datetime import datetime
import asyncio
import traceback
from app.repositories.scan_repository import scan_repo
from app.repositories.risk_repository import risk_repo
from app.models.scan_model import Scan
from app.schemas.scan_schema import ScanCreate
from app.scanners.aws_scanner import AWSScanner
from app.scanners.azure_scanner import AzureScanner
from app.ai.risk_analyzer import RiskAnalyzer
from app.ai.risk_scorer import RiskScorer
from app.ai.remediation_engine import RemediationEngine
from app.models.risk_model import Risk
from app.services.remediation_service import remediation_service
from app.core.logging import logger
# from app.api.v1.websocket_alerts import manager as ws_manager

class ScanService:
    def __init__(self):
        self.ai_analyzer = RiskAnalyzer()
        self.risk_scorer = RiskScorer()
        self.remediation_engine = RemediationEngine()

    async def start_scan(self, user_id: str, scan_in: ScanCreate):
        logger.info("Scan started", user_id=user_id, provider=scan_in.provider)
        
        try:
            # Initialize scan in DB
            scan = Scan(
                user_id=user_id,
                provider=scan_in.provider,
                status="running"
            )
            scan = await scan_repo.create(scan)
            
            # Generate exactly the requested mock risks
            risks = await self.run_scan(scan_in.provider, user_id, scan.id)
            
            # AI Enrichment Phase (Optional for mock, keeping for compatibility)
            try:
                await self._enrich_scan_with_ai(scan.id)
            except Exception as e:
                logger.error("ai_enrichment_failed_but_continuing", error=str(e))
            
            # Update Scan Metadata
            await scan_repo.update(
                scan_id=scan.id,
                update_data={
                    "status": "completed",
                    "total_resources": len(risks),
                    "total_risks": len(risks),
                    "completed_at": datetime.utcnow()
                }
            )
            
            return {
                "status": "scan_completed",
                "risks_generated": len(risks)
            }
        except Exception as e:
            logger.error("scan_failed", error=str(e), traceback=traceback.format_exc())
            return {
                "status": "error",
                "message": "scan failed"
            }

    async def run_scan(self, provider: str, user_id: str, scan_id: str):
        logger.info("generating_mock_risks", provider=provider, scan_id=scan_id)
        
        mock_data = [
            {
                "resource": "S3 Bucket",
                "resource_name": "prod-customer-data-bucket",
                "issue": "Public access enabled",
                "severity": "Critical",
                "provider": provider
            },
            {
                "resource": "Security Group",
                "resource_name": "sg-abc123",
                "issue": "Port 22 open to world",
                "severity": "High",
                "provider": provider
            },
            {
                "resource": "IAM Role",
                "resource_name": "DevTeamFullAccess",
                "issue": "Wildcard permissions",
                "severity": "Medium",
                "provider": provider
            }
        ]
        
        logger.info("Risks generated", count=len(mock_data))
        
        saved_risks = []
        for rd in mock_data:
            # Create Risk model instance
            risk = Risk(
                scan_id=scan_id,
                user_id=user_id,
                resource=rd["resource"],
                resource_name=rd["resource_name"],
                issue=rd["issue"],
                severity=rd["severity"],
                provider=rd["provider"],
                timestamp=datetime.utcnow(),
                # For compatibility with existing systems
                resource_type=rd["resource"],
                resource_id=rd["resource_name"],
                title=rd["issue"],
                category="Security Misconfiguration",
                risk_score=95 if rd["severity"] == "Critical" else 80 if rd["severity"] == "High" else 50,
                created_at=datetime.utcnow()
            )
            
            # Store in MongoDB via repository
            await risk_repo.create(risk)
            saved_risks.append(risk)
            
            # Broadcast WebSocket alert for High/Critical
            if rd["severity"] in ["Critical", "High"]:
                alert_msg = {
                    "severity": rd["severity"],
                    "message": rd["issue"],
                    "resource": rd["resource_name"],
                    "timestamp": datetime.utcnow().isoformat()
                }
                from app.api.v1.websocket_alerts import manager as ws_manager
                await ws_manager.broadcast(alert_msg)

        logger.info("Risks stored", count=len(saved_risks))
        return saved_risks

    async def _run_aws_scan(self, user_id: str, scan_id: str):
        pass # Mocked out

    async def _run_azure_scan(self, user_id: str, scan_id: str):
        try:
            scanner = AzureScanner(user_id=user_id, scan_id=scan_id)
            await scanner.run()
            # AI Enrichment Phase
            await self._enrich_scan_with_ai(scan_id)
        except Exception as e:
            logger.error("azure_scan_execution_failed", scan_id=scan_id, error=str(e))
            await scan_repo.update(
                scan_id=scan_id,
                update_data={"status": "failed", "completed_at": datetime.utcnow()}
            )

    async def _enrich_scan_with_ai(self, scan_id: str):
        try:
            logger.info("starting_ai_enrichment_phase", scan_id=scan_id)
            # 1. Fetch raw risks
            risks = await risk_repo.get_by_scan(scan_id)
            risk_dicts = [r.model_dump() for r in risks]
            
            # 2. Run AI Analysis (Sync AI logic in thread)
            analysis_results = await asyncio.to_thread(self.ai_analyzer.analyze_risks, risk_dicts)
            
            # 3. Update MongoDB Risk records
            for enriched_risk in analysis_results["all_risks"]:
                risk_id = enriched_risk.get("id")
                if risk_id:
                    update_data = {
                        "risk_score": enriched_risk.get("risk_score"),
                        "risk_cluster": enriched_risk.get("risk_cluster"),
                        "ai_explanation": enriched_risk.get("ai_explanation")
                    }
                    await risk_repo.update(risk_id, update_data)
                    
                    # Broadcast live alert for Critical and High risks
                    if update_data.get("risk_cluster") in ["Critical", "High"]:
                        alert_payload = {
                            "type": "security_alert",
                            "severity": update_data.get("risk_cluster"),
                            "resource": enriched_risk.get("resource_id", "Unknown Resource"),
                            "issue": enriched_risk.get("title", "Security misconfiguration detected"),
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        from app.api.v1.websocket_alerts import manager as ws_manager
                        await ws_manager.broadcast(alert_payload)
            
            logger.info("completed_ai_enrichment_phase", scan_id=scan_id, risks_updated=len(risks))
            
            # 4. Trigger Remediation Generation
            await remediation_service.generate_and_save_remediations(scan_id)
            
        except Exception as e:
            logger.error("ai_enrichment_failed", scan_id=scan_id, error=str(e))

    async def get_history(self, user_id: str):
        return await scan_repo.get_by_user(user_id)

    async def get_scan_risks(self, scan_id: str):
        return await risk_repo.get_by_scan(scan_id)

scan_service = ScanService()
