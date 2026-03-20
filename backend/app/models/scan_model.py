from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class Scan(BaseModel):
    id: Optional[str] = None
    user_id: str
    provider: str
    status: str
    total_resources: int = 0
    total_risks: int = 0
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
