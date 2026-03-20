from fastapi import APIRouter

router = APIRouter()

@router.get("/priority-insights")
async def get_priority_insights():
    """
    Returns mock AI priority insights to ensure dashboard stability and correct display.
    """
    return [
        {
            "title": "Critical S3 Exposure",
            "severity": "AIURGENT",
            "description": "Public S3 bucket detected exposing sensitive customer data.",
            "confidence": 94,
            "resource": "prod-customer-data-bucket"
        },
        {
            "title": "Cryptomining Port Open",
            "severity": "AIURGENT",
            "description": "Port 4444 detected in security group ingress.",
            "confidence": 87,
            "resource": "sg-abc123"
        }
    ]
