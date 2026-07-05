from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.entry import Entry
from app.schemas.entry import EntryStart, EntryUpdate, EntryOut
from app.services.entry_service import (
    get_active_entry,
    start_entry,
    stop_entry,
    get_entries_by_date,
    get_entries_by_range,
    update_entry,
    delete_entry,
)
from app.routers.auth import get_current_user
from app.config import TIMEZONE
import zoneinfo
from datetime import datetime

router = APIRouter(prefix="/entries", tags=["entries"])


def _entry_to_out(entry) -> EntryOut:
    duration = None
    if entry.ended_at:
        duration = int((entry.ended_at - entry.started_at).total_seconds())
    return EntryOut(
        id=entry.id,
        user_id=entry.user_id,
        label=entry.label,
        started_at=entry.started_at,
        ended_at=entry.ended_at,
        duration_seconds=duration,
        created_at=entry.created_at,
    )


@router.post("/start", response_model=EntryOut)
def start(payload: EntryStart, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = start_entry(db, current_user.id, payload.label)
    return _entry_to_out(entry)


@router.post("/stop", response_model=EntryOut)
def stop(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = stop_entry(db, current_user.id)
    if entry is None:
        raise HTTPException(status_code=404, detail="No active entry")
    return _entry_to_out(entry)


@router.get("/active", response_model=EntryOut | None)
def active(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = get_active_entry(db, current_user.id)
    if entry is None:
        return None
    return _entry_to_out(entry)


@router.get("", response_model=list[EntryOut])
def list_entries(
    date: str | None = None,
    from_: str | None = None,
    to: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if date:
        entries = get_entries_by_date(db, current_user.id, date)
    elif from_ and to:
        from app.config import TIMEZONE
        import zoneinfo
        from datetime import datetime as dt_mod
        tz = zoneinfo.ZoneInfo(TIMEZONE)
        from_dt = dt_mod.strptime(from_, "%Y-%m-%d").replace(tzinfo=tz)
        to_dt = dt_mod.strptime(to, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=tz)
        entries = get_entries_by_range(db, current_user.id, from_dt, to_dt)
    else:
        entries = []
    return [_entry_to_out(e) for e in entries]


@router.patch("/{entry_id}", response_model=EntryOut)
def patch_entry(entry_id: int, payload: EntryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = payload.model_dump(exclude_unset=True)
    entry = update_entry(db, entry_id, current_user.id, data)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return _entry_to_out(entry)


@router.delete("/{entry_id}", status_code=204)
def remove_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted = delete_entry(db, entry_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Entry not found")