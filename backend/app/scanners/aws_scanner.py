from datetime import datetime
import asyncio
from app.scanners.aws_resource_discovery import AWSResourceDiscovery
from app.scanners.aws_misconfig_detector import AWSMisconfigDetector
from app.repositories.risk_repository import risk_repo
from app.repositories.scan_repository import scan_repo
from app.models.risk_model import Risk
from app.models.scan_model import Scan
from app.core.logging import logger

class AWSScanner:
    def __init__(self, user_id: str, scan_id: str, region: str = "us-east-1"):
        self.user_id = user_id
        self.scan_id = scan_id
        self.discovery = AWSResourceDiscovery(region=region)
        self.detector = AWSMisconfigDetector()

    async def run(self):
        logger.info("starting_aws_scan_orchestration", scan_id=self.scan_id, user_id=self.user_id)
        
        # 1. Discover Resources (offload sync boto3 calls to thread)
        resources = await asyncio.to_thread(self.discovery.discover_all)
        
        # 2. Detect Misconfigurations (offload sync logic to thread)
        detected_issues = await asyncio.to_thread(self.detector.detect, resources)
        
        # 3. Create Risk Objects and Store them via Repository
        risks_stored = 0
        for issue in detected_issues:
            risk = Risk(
                scan_id=str(self.scan_id),
                user_id=str(self.user_id),
                severity=issue["severity"],
                resource_id=issue["resource_id"],
                resource_type=issue["resource_type"],
                category="Security Misconfiguration",
                title=issue["issue"],
                description=issue["description"],
                remediation=issue["recommendation"]
            )
            await risk_repo.create(risk)
            risks_stored += 1
        
        # 4. Update Scan Metadata via Repository
        await scan_repo.update(
            scan_id=str(self.scan_id),
            update_data={
                "status": "completed",
                "total_resources": len(resources),
                "total_risks": risks_stored,
                "completed_at": datetime.utcnow()
            }
        )
        
        logger.info("completed_aws_scan_orchestration", scan_id=self.scan_id, risks_found=risks_stored)
        return risks_stored
