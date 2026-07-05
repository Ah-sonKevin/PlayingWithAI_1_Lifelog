from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.stats import StatsOut
from app.services.stats_service import get_stats
from app.routers.auth import get_current_user
from app.config import TIMEZONE
import zoneinfo
from datetime import datetime as dt_mod

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsOut)
def stats(
    from_: str = Query(alias="from"),
    to: str = Query(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tz = zoneinfo.ZoneInfo(TIMEZONE)
    from_dt = dt_mod.strptime(from_, "%Y-%m-%d").replace(tzinfo=tz)
    to_dt = dt_mod.strptime(to, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=tz)
    result = get_stats(db, current_user.id, from_dt, to_dt)
    return result