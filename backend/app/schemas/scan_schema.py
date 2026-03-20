from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class ScanBase(BaseModel):
    provider: str

class ScanCreate(ScanBase):
    pass

class ScanResponse(ScanBase):
    id: str = Field(..., example="69b4544958aa5d46ba3b4461")
    status: str = Field(..., example="completed")
    total_resources: int = Field(0, example=25)
    total_risks: int = Field(0, example=3)
    started_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class RiskResponse(BaseModel):
    id: str = Field(..., example="69b4544958aa5d46ba3b4462")
    scan_id: str
    resource: Optional[str] = None
    resource_name: Optional[str] = None
    issue: Optional[str] = None
    severity: str = Field(..., example="High")
    resource_id: Optional[str] = None
    resource_type: Optional[str] = None
    category: Optional[str] = None
    title: Optional[str] = None
    risk_score: Optional[float] = None
    risk_cluster: Optional[str] = None
    ai_explanation: Optional[str] = None
    description: Optional[str] = None
    remediation: Optional[str] = None
    remediation_steps: Optional[List[str]] = None
    ai_recommendation: Optional[str] = None
    provider: Optional[str] = None
    timestamp: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DashboardSummary(BaseModel):
    total_resources: int = Field(0, example=150)
    total_risks: int = Field(0, example=12)
    critical_risks: int = Field(0, example=2)
    high_risks: int = Field(0, example=4)
    medium_risks: int = Field(0, example=5)
    low_risks: int = Field(0, example=1)
