from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class Notification(BaseModel):
    id: Optional[str] = None
    title: str
    message: str
    severity: str = "low"
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
