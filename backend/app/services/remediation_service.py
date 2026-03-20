from typing import List, Dict, Any
from app.ai.remediation_engine import RemediationEngine
from app.repositories.risk_repository import risk_repo
from app.core.logging import logger

class RemediationService:
    def __init__(self):
        self.engine = RemediationEngine()

    async def generate_and_save_remediations(self, scan_id: str):
        """
        Processes all risks for a scan and attaches AI remediation advice.
        """
        try:
            logger.info("starting_remediation_generation", scan_id=scan_id)
            risks = await risk_repo.get_by_scan(scan_id)
            
            updated_count = 0
            for risk in risks:
                risk_dict = risk.model_dump()
                
                # Generate advice
                remediation = self.engine.generate_remediation(risk_dict)
                
                # Update DB
                update_data = {
                    "remediation_steps": remediation["remediation_steps"],
                    "ai_recommendation": remediation["ai_recommendation"]
                }
                
                if await risk_repo.update(risk.id, update_data):
                    updated_count += 1
                    
            logger.info("completed_remediation_generation", scan_id=scan_id, count=updated_count)
            return updated_count
            
        except Exception as e:
            logger.error("remediation_service_failed", error=str(e), scan_id=scan_id)
            return 0

    async def get_risks_with_remediation(self, user_id: str):
        # Implementation for the new endpoint
        # We'll need a way to filter or just get latest risks
        pass

remediation_service = RemediationService()
