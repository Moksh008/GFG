from __future__ import annotations

from datetime import date, datetime, timezone


def aware(dt: datetime) -> datetime:
    """SQLite returns naive datetimes; treat them as UTC."""
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def display_date(dt: datetime) -> str:
    return aware(dt).strftime("%b %d, %Y")


def relative_time(dt: datetime, now: datetime | None = None) -> str:
    now = now or datetime.now(timezone.utc)
    secs = (now - aware(dt)).total_seconds()
    if secs < 90:
        return "Just now"
    if secs < 3600:
        return f"{int(secs // 60)} min ago"
    if secs < 86400:
        h = int(secs // 3600)
        return f"{h} hour{'s' if h != 1 else ''} ago"
    d = int(secs // 86400)
    if d == 1:
        return "Yesterday"
    if d < 60:
        return f"{d} days ago"
    return f"{d // 30} months ago"


def days_between(a: datetime, b: datetime) -> float:
    return abs((aware(b) - aware(a)).total_seconds()) / 86400


def today_utc() -> date:
    return datetime.now(timezone.utc).date()
