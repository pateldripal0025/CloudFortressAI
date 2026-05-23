import asyncio
import httpx
import hashlib
import time
import random
from datetime import datetime
from typing import Dict, Any, List
from app.core.logging import logger
from app.database.mongodb import get_db
from app.database.redis import get_redis
from app.scanners.aws_misconfig_detector import AWSMisconfigDetector
from app.scanners.azure_misconfig_detector import AzureMisconfigDetector

class RealtimeScanner:
    """
    CloudFortress AI: Real-Time Security Event Scanner
    
    An enterprise-grade, high-throughput, fault-tolerant event processor. It receives
    continuous audit event feeds, performs Redis-deduplication, executes rapid targeted micro-scans,
    and resilience-broadcasts discovered threat vectors to WebSockets and UI servers with fallback DLQ support.
    """
    def __init__(self):
        self.aws_detector = AWSMisconfigDetector()
        self.azure_detector = AzureMisconfigDetector()
        self.express_webhook_url = "http://localhost:5001/api/alerts/realtime"
        
        # Idempotency cache and Telemetry states
        self.mem_cache = {}  # In-memory fallback TTL cache
        self.total_processing_time_ms = 0.0
        self.telemetry = {
            "events_received": 0,
            "events_processed": 0,
            "deduplication_hits": 0,
            "delivery_successes": 0,
            "delivery_failures": 0,
            "delivery_retries": 0,
            "dlq_count": 0,
            "average_processing_time_ms": 0.0,
            "last_processed_timestamp": None
        }

    def _compute_event_hash(self, event: Dict[str, Any]) -> str:
        """
        Generates a SHA256 checksum uniquely identifying a cloud event signature.
        """
        provider = event.get("provider", "AWS")
        source = event.get("event_source", "unknown")
        name = event.get("event_name", "unknown")
        res_id = event.get("resource_id", "unknown")
        
        # Construct exact unique footprint string
        footprint = f"{provider.upper()}:{source.lower()}:{name.lower()}:{res_id.lower()}"
        return hashlib.sha256(footprint.encode("utf-8")).hexdigest()

    async def check_idempotency(self, event: Dict[str, Any]) -> bool:
        """
        Asserts event uniqueness. Checks Redis (with 5-minute expiry) or falls back to
        an in-memory TTL dictionary if Redis is unreachable. Returns True if duplicate.
        """
        self.telemetry["events_received"] += 1
        event_hash = self._compute_event_hash(event)
        redis_key = f"realtime_event:idempotency:{event_hash}"
        ttl = 300  # 5-minute window for event duplication storms
        
        # 1. Attempt High-Speed Redis Validation
        try:
            r_client = await get_redis()
            if r_client:
                # set returns True if the key was set successfully (indicating brand new event)
                is_new = await r_client.set(redis_key, "1", ex=ttl, nx=True)
                if not is_new:
                    self.telemetry["deduplication_hits"] += 1
                    return True
                return False
        except Exception as e:
            logger.warning("redis_idempotency_failed_falling_back_to_memory", error=str(e))
            
        # 2. Resilient Graceful Memory Fallback
        now = time.time()
        # Clean expired keys
        expired_keys = [k for k, expiry in self.mem_cache.items() if expiry < now]
        for k in expired_keys:
            self.mem_cache.pop(k, None)
            
        if event_hash in self.mem_cache:
            self.telemetry["deduplication_hits"] += 1
            return True
            
        self.mem_cache[event_hash] = now + ttl
        return False

    async def process_cloud_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes a real-time event representing a state change in the cloud infrastructure.
        Exposed to BackgroundTasks for lightning fast non-blocking HTTP responses.
        """
        start_time = time.perf_counter()
        provider = event.get("provider", "AWS")
        event_name = event.get("event_name", "UnknownEvent")
        resource_id = event.get("resource_id")
        resource_type = event.get("resource_type")
        
        logger.info("realtime_scan_triggered", 
                    provider=provider, 
                    event=event_name, 
                    resource=resource_id)

        try:
            # 1. Fetch targeted resource configuration from the cloud (Mocked configuration here for the prototype)
            resource_config = self._get_mocked_resource_config(resource_type, resource_id)
            
            # 2. Run highly targeted micro-scans instead of heavy full discoveries
            risks = []
            if provider == "AWS":
                risks = await asyncio.to_thread(self._scan_single_aws_resource, resource_config)
            elif provider == "Azure":
                risks = await asyncio.to_thread(self._scan_single_azure_resource, resource_config)

            # 3. If risks are discovered, persist them immediately and stream alerts
            if risks:
                for risk in risks:
                    await self._persist_realtime_risk(risk, event)
                    await self._broadcast_realtime_alert(risk, event)
                    
                status = "threats_detected"
                result = {
                    "status": status,
                    "risk_count": len(risks),
                    "risks": risks
                }
            else:
                status = "secure"
                result = {"status": status, "message": "No immediate threats detected."}
                
        except Exception as e:
            logger.error("realtime_processing_exception", error=str(e))
            status = "failed"
            await self._route_to_dead_letter_queue(
                {"error_detail": str(e)}, 
                event, 
                "Exception triggered during micro-scanning execution workflow."
            )
            result = {"status": "failed", "message": f"Processing execution failed: {str(e)}"}

        # 4. Finalize Performance Metrics
        end_time = time.perf_counter()
        elapsed_ms = (end_time - start_time) * 1000.0
        
        self.telemetry["events_processed"] += 1
        self.telemetry["last_processed_timestamp"] = datetime.utcnow().isoformat()
        self.total_processing_time_ms += elapsed_ms
        self.telemetry["average_processing_time_ms"] = round(
            self.total_processing_time_ms / self.telemetry["events_processed"], 2
        )
        
        return result

    def _scan_single_aws_resource(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Executes dedicated checks for a single AWS resource.
        """
        res_type = resource.get("resource_type")
        if res_type == "AWS::S3::Bucket":
            return self.aws_detector.check_s3_public(resource)
        elif res_type == "AWS::EC2::SecurityGroup":
            return self.aws_detector.check_security_group(resource)
        elif res_type == "AWS::RDS::DBInstance":
            return self.aws_detector.check_rds_public(resource)
        elif res_type == "AWS::IAM::Role":
            return self.aws_detector.check_iam_role(resource)
        return []

    def _scan_single_azure_resource(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Executes dedicated checks for a single Azure resource.
        """
        res_type = resource.get("resource_type")
        if res_type == "Microsoft.Storage/storageAccounts":
            return self.azure_detector.check_storage_public(resource)
        elif res_type == "Microsoft.Network/networkSecurityGroups":
            return self.azure_detector.check_nsg_open(resource)
        return []

    async def _persist_realtime_risk(self, risk: Dict[str, Any], event: Dict[str, Any]):
        """
        Saves the detected real-time risk directly to MongoDB.
        """
        try:
            db = await get_db()
            risk_document = {
                "scan_id": "realtime-continuous-monitoring",
                "user_id": event.get("user_id", "system-default"),
                "resource": risk["resource_type"],
                "resource_name": risk["resource_id"],
                "resource_id": risk["resource_id"],
                "resource_type": risk["resource_type"],
                "issue": risk["issue"],
                "title": risk["issue"],
                "severity": risk["severity"],
                "description": risk["description"],
                "remediation": risk["recommendation"],
                "provider": event.get("provider"),
                "category": "Real-Time Threat Detection",
                "timestamp": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
            await db.risks.insert_one(risk_document)
            logger.info("realtime_risk_persisted", resource_id=risk["resource_id"])
        except Exception as e:
            logger.error("realtime_persistence_failed", error=str(e))

    async def _broadcast_realtime_alert(self, risk: Dict[str, Any], event: Dict[str, Any]):
        """
        Streams the threat alert immediately across multiple channels:
        1. Fast API WebSocket Connection Manager
        2. Express Webhook for Socket.io UI propagation with Exponential Backoff + Jitter
        """
        alert_payload = {
            "type": "realtime_threat",
            "severity": risk["severity"],
            "resource": risk["resource_id"],
            "resource_type": risk["resource_type"],
            "issue": risk["issue"],
            "event_source": event.get("event_source"),
            "event_name": event.get("event_name"),
            "timestamp": datetime.utcnow().isoformat()
        }

        # Channel 1: FastAPI Websocket Clients
        try:
            from app.api.v1.websocket_alerts import manager as ws_manager
            await ws_manager.broadcast(alert_payload)
        except Exception as e:
            logger.error("realtime_alert_websocket_broadcast_failed", error=str(e))

        # Channel 2: Resilient HTTP Broadcast with Backoff & Jitter
        max_retries = 3
        base_delay = 1.0
        success = False
        
        async with httpx.AsyncClient() as client:
            for attempt in range(1, max_retries + 1):
                try:
                    response = await client.post(self.express_webhook_url, json=alert_payload, timeout=3.0)
                    if response.status_code == 200:
                        logger.debug("realtime_alert_sent_to_express_success", attempt=attempt)
                        self.telemetry["delivery_successes"] += 1
                        success = True
                        break
                    else:
                        logger.error("realtime_alert_express_http_error", status_code=response.status_code, attempt=attempt)
                except Exception as e:
                    logger.error("realtime_alert_express_failed_attempt", error=str(e), attempt=attempt)
                
                if attempt < max_retries:
                    self.telemetry["delivery_retries"] += 1
                    # Full Jitter formula
                    temp = min(30.0, base_delay * (2 ** attempt))
                    sleep_time = temp / 2.0 + random.uniform(0.0, temp / 2.0)
                    logger.info("retrying_broadcast_alert_backoff", sleep_seconds=round(sleep_time, 2), attempt=attempt)
                    await asyncio.sleep(sleep_time)
            
            if not success:
                self.telemetry["delivery_failures"] += 1
                logger.error("realtime_alert_delivery_exhausted_routing_to_dlq", resource_id=risk["resource_id"])
                await self._route_to_dead_letter_queue(
                    risk, 
                    event, 
                    "Express webhook alert transmission failed after maximum retries."
                )

    async def _route_to_dead_letter_queue(self, payload: Dict[str, Any], event: Dict[str, Any], reason: str):
        """
        Persists failed/undelivered scan alerts into MongoDB Dead Letter Queue (DLQ) for audits.
        """
        try:
            db = await get_db()
            dlq_document = {
                "failed_at": datetime.utcnow(),
                "reason": reason,
                "event_payload": event,
                "scan_payload": payload,
                "status": "UNRESOLVED_CRITICAL_EVENT"
            }
            await db.dead_letter_events.insert_one(dlq_document)
            self.telemetry["dlq_count"] += 1
            logger.warning("event_routed_to_dead_letter_queue", reason=reason)
        except Exception as e:
            logger.critical("dead_letter_queue_persistence_failed", error=str(e))

    async def get_telemetry(self) -> Dict[str, Any]:
        """
        Compiles dynamic live processor metrics.
        """
        return {
            "status": "HEALTHY",
            "engine": "CloudFortress AI Production Event Processor",
            "metrics": self.telemetry,
            "timestamp": datetime.utcnow().isoformat()
        }

    def _get_mocked_resource_config(self, resource_type: str, resource_id: str) -> Dict[str, Any]:
        """
        Simulates fetching configuration from AWS SDK/Azure CLI.
        Creates an intentional risk for demonstration/prototype testing.
        """
        base_config = {
            "resource_id": resource_id,
            "resource_name": resource_id,
            "resource_type": resource_type,
            "arn": f"arn:aws:demo:::{resource_id}"
        }
        
        if resource_type == "AWS::S3::Bucket":
            base_config["configuration"] = {
                "PublicAccessBlockConfiguration": {
                    "BlockPublicAcls": False,
                    "IgnorePublicAcls": False,
                    "BlockPublicPolicy": False,
                    "RestrictPublicBuckets": False
                }
            }
        elif resource_type == "AWS::EC2::SecurityGroup":
            base_config["configuration"] = {
                "IpPermissions": [
                    {
                        "IpProtocol": "tcp",
                        "FromPort": 22,
                        "ToPort": 22,
                        "IpRanges": [{"CidrIp": "0.0.0.0/0"}]
                    }
                ]
            }
        elif resource_type == "Microsoft.Storage/storageAccounts":
            base_config["configuration"] = {
                "allowBlobPublicAccess": True
            }
        else:
            base_config["configuration"] = {}
            
        return base_config

# Singleton instance
realtime_scanner = RealtimeScanner()

