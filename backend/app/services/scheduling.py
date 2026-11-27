"""Doctor availability: turns each provider's daily clinic times into concrete bookable slots.

A provider's ``slots`` column holds clinic times as ``"HH:MM"`` strings. Bookable slots are
generated for the coming days (Mon–Sat) and identified by a local wall-clock ISO string,
``"YYYY-MM-DDTHH:MM"`` — that string is what the client books and what an Appointment stores.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.entities import Appointment, Doctor

_TIME = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")
SLOT_FORMAT = "%Y-%m-%dT%H:%M"
BOOKING_WINDOW_DAYS = 7
MIN_LEAD_MINUTES = 60  # can't book a slot that starts within the next hour


def clinic_times(doc: Doctor) -> list[str]:
    """The provider's daily clinic times, ignoring any legacy free-text entries."""
    return sorted(t for t in (doc.slots or []) if isinstance(t, str) and _TIME.match(t))


def parse_slot(slot: str) -> datetime | None:
    try:
        return datetime.strptime(slot, SLOT_FORMAT)
    except (TypeError, ValueError):
        return None


def booked_slots(db: Session, doctor_ids: list[int] | None = None) -> dict[int, set[str]]:
    stmt = select(Appointment.doctor_id, Appointment.slot).where(Appointment.status == "confirmed")
    if doctor_ids is not None:
        stmt = stmt.where(Appointment.doctor_id.in_(doctor_ids))
    out: dict[int, set[str]] = {}
    for doc_id, slot in db.execute(stmt):
        if doc_id is not None:
            out.setdefault(doc_id, set()).add(slot)
    return out


def open_slots(doc: Doctor, booked: set[str] | None = None, now: datetime | None = None,
               days: int = BOOKING_WINDOW_DAYS) -> list[str]:
    """Free slots for the next ``days`` days, chronologically. Empty when the provider is away."""
    if doc.status != "Available":
        return []
    now = now or datetime.now()
    earliest = now + timedelta(minutes=MIN_LEAD_MINUTES)
    booked = booked or set()
    times = clinic_times(doc)
    out = []
    for offset in range(days + 1):
        day = (now + timedelta(days=offset)).date()
        if day.weekday() == 6:  # clinics closed on Sundays
            continue
        for t in times:
            h, m = map(int, t.split(":"))
            start = datetime(day.year, day.month, day.day, h, m)
            key = start.strftime(SLOT_FORMAT)
            if start >= earliest and key not in booked:
                out.append(key)
    return out


def format_slot(slot: str) -> str:
    """Human-readable slot, e.g. 'Sat, Nov 28 2026, 2:30 PM'. Legacy free-text slots pass through."""
    dt = parse_slot(slot)
    if dt is None:
        return slot
    return f"{dt:%a, %b} {dt.day} {dt.year}, {dt.hour % 12 or 12}:{dt:%M} {'AM' if dt.hour < 12 else 'PM'}"
