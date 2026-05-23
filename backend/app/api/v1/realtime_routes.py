from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, status
from app.schemas.realtime_schema import CloudEventPayload
from app.scanners.realtime_scanner import realtime_scanner
from app.core.config import settings
from app.core.logging import logger

router = APIRouter()

@router.post("/event")
async def trigger_realtime_scan(
    event: CloudEventPayload,
    background_tasks: BackgroundTasks,
    x_cloudfortress_signature: str = Header(None, alias="X-CloudFortress-Signature")
):
    """
    Receives real-time security events (e.g., webhook notifications from AWS EventBridge, 
    Azure EventGrid, or custom audit controllers), validates signature security, 
    verifies payload schema compliance, checks idempotency, and schedules a micro-scan instantly.
    """
    # Enforce API Key / Webhook signature security check
    if not x_cloudfortress_signature or x_cloudfortress_signature != settings.WEBHOOK_SECRET:
        logger.warning("unauthorized_realtime_event_attempt", signature_present=bool(x_cloudfortress_signature))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-CloudFortress-Signature security token."
        )
    
    event_dict = event.model_dump()
    logger.info("realtime_endpoint_event_received", event_source=event_dict.get("event_source"))
    
    # Pre-check idempotency to prevent queueing duplicates
    is_duplicate = await realtime_scanner.check_idempotency(event_dict)
    if is_duplicate:
        logger.info("realtime_event_deduplicated_at_endpoint", resource_id=event_dict.get("resource_id"))
        return {
            "status": "cached",
            "message": "Duplicate event detected and deduplicated. Processing bypassed.",
            "target_resource": event_dict.get("resource_id")
        }
    
    # Process scanning asynchronously as a background task to keep endpoints fast and non-blocking
    background_tasks.add_task(realtime_scanner.process_cloud_event, event_dict)
    
    return {
        "status": "queued",
        "message": "Real-time threat assessment initiated.",
        "target_resource": event_dict.get("resource_id")
    }

@router.get("/telemetry")
async def get_telemetry_metrics():
    """
    Exposes continuous performance monitoring telemetry, success metrics, retry rates, and Dead Letter Queue status.
    """
    return await realtime_scanner.get_telemetry()

