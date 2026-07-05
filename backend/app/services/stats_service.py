from datetime import datetime, timezone
from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.entry import Entry
from app.config import TIMEZONE
import zoneinfo


def _duration_seconds(started_at: datetime, ended_at: datetime | None) -> int:
    end = ended_at if ended_at else datetime.now(timezone.utc)
    return int((end - started_at).total_seconds())


def get_stats(db: Session, user_id: int, from_dt: datetime, to_dt: datetime) -> dict:
    entries = db.query(Entry).filter(
        Entry.user_id == user_id,
        Entry.started_at >= from_dt,
        Entry.started_at <= to_dt,
    ).order_by(Entry.started_at).all()

    tz = zoneinfo.ZoneInfo(TIMEZONE)

    # Totals by label
    totals: dict[str, int] = {}
    for e in entries:
        secs = _duration_seconds(e.started_at, e.ended_at)
        totals[e.label] = totals.get(e.label, 0) + secs

    totals_by_label = [{"label": k, "total_seconds": v} for k, v in sorted(totals.items(), key=lambda x: -x[1])]

    total_all = sum(t["total_seconds"] for t in totals_by_label) or 1

    distribution = [
        {"label": t["label"], "percentage": round(t["total_seconds"] / total_all * 100, 1)}
        for t in totals_by_label
    ]

    # Tasks per day and daily series
    from collections import defaultdict
    day_counts: dict[str, int] = defaultdict(int)
    day_seconds: dict[str, int] = defaultdict(int)

    for e in entries:
        day_key = e.started_at.astimezone(tz).strftime("%Y-%m-%d")
        day_counts[day_key] += 1
        end = e.ended_at if e.ended_at else datetime.now(timezone.utc)
        day_seconds[day_key] += int((end - e.started_at).total_seconds())

    tasks_per_day = [{"date": d, "count": c} for d, c in sorted(day_counts.items())]
    daily_series = [{"date": d, "total_seconds": s} for d, s in sorted(day_seconds.items())]

    return {
        "totals_by_label": totals_by_label,
        "tasks_per_day": tasks_per_day,
        "distribution": distribution,
        "daily_series": daily_series,
    }