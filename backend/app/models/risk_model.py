from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class Risk(BaseModel):
    id: Optional[str] = None
    scan_id: str
    user_id: str
    resource: Optional[str] = None
    resource_type: Optional[str] = None
    resource_name: Optional[str] = None
    resource_id: Optional[str] = None
    issue: Optional[str] = None
    category: Optional[str] = None
    title: Optional[str] = None
    severity: str
    risk_score: Optional[float] = None
    risk_cluster: Optional[str] = None
    ai_explanation: Optional[str] = None
    ai_analysis: Optional[str] = None
    remediation: Optional[str] = None
    remediation_steps: Optional[List[str]] = None
    ai_recommendation: Optional[str] = None
    provider: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
