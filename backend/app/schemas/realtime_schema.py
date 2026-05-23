from pydantic import BaseModel, Field, field_validator
from typing import Optional

class CloudEventPayload(BaseModel):
    event_source: str = Field(..., description="Source of the event, e.g. aws.s3")
    event_name: str = Field(..., description="Name of the event, e.g. CreateBucket")
    provider: str = Field(..., description="Cloud provider name, e.g. AWS, Azure, GCP")
    resource_id: str = Field(..., description="Identifier of the resource")
    resource_type: str = Field(..., description="Type of the resource, e.g. AWS::S3::Bucket")
    user_identity: str = Field(..., description="Identity that triggered the event")
    user_id: Optional[str] = Field("system-default", description="Optional tenant or user identifier")

    @field_validator('provider')
    @classmethod
    def validate_provider(cls, v: str) -> str:
        allowed = ['AWS', 'Azure', 'GCP']
        if v not in allowed:
            raise ValueError(f"Provider must be one of {allowed}")
        return v
