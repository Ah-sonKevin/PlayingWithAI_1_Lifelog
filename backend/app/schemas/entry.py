from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class EntryStart(BaseModel):
    label: str


class EntryUpdate(BaseModel):
    label: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


class EntryOut(BaseModel):
    id: int
    user_id: int
    label: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True