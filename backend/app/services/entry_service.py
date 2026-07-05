from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.entry import Entry


def get_active_entry(db: Session, user_id: int) -> Entry | None:
    return db.query(Entry).filter(
        Entry.user_id == user_id,
        Entry.ended_at.is_(None),
    ).first()


def start_entry(db: Session, user_id: int, label: str) -> Entry:
    active = get_active_entry(db, user_id)
    now = datetime.now(timezone.utc)
    if active:
        active.ended_at = now
        db.flush()
    entry = Entry(user_id=user_id, label=label, started_at=now)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def stop_entry(db: Session, user_id: int) -> Entry | None:
    active = get_active_entry(db, user_id)
    if active is None:
        return None
    active.ended_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(active)
    return active


def get_entries_by_date(db: Session, user_id: int, date: str) -> list[Entry]:
    from datetime import datetime as dt_mod
    from app.config import TIMEZONE
    import zoneinfo

    tz = zoneinfo.ZoneInfo(TIMEZONE)
    start = dt_mod.strptime(date, "%Y-%m-%d").replace(tzinfo=tz)
    end = dt_mod(start.year, start.month, start.day, 23, 59, 59, tzinfo=tz)
    return db.query(Entry).filter(
        Entry.user_id == user_id,
        Entry.started_at >= start,
        Entry.started_at <= end,
    ).order_by(Entry.started_at).all()


def get_entries_by_range(db: Session, user_id: int, from_dt: datetime, to_dt: datetime) -> list[Entry]:
    return db.query(Entry).filter(
        Entry.user_id == user_id,
        Entry.started_at >= from_dt,
        Entry.started_at <= to_dt,
    ).order_by(Entry.started_at).all()


def update_entry(db: Session, entry_id: int, user_id: int, data: dict) -> Entry | None:
    entry = db.query(Entry).filter(Entry.id == entry_id, Entry.user_id == user_id).first()
    if entry is None:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_entry(db: Session, entry_id: int, user_id: int) -> bool:
    entry = db.query(Entry).filter(Entry.id == entry_id, Entry.user_id == user_id).first()
    if entry is None:
        return False
    db.delete(entry)
    db.commit()
    return True