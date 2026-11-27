"""Pydantic request bodies. Accept camelCase (frontend) or snake_case."""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel


class In(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")


# ---------------------------------------------------------------- auth
class RegisterIn(In):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=120)


class LoginIn(In):
    email: EmailStr
    password: str


class RefreshIn(In):
    refresh_token: str


class ProfileUpdate(In):
    full_name: str | None = Field(default=None, max_length=120)
    date_of_birth: str | None = None
    skin_type: str | None = None
    primary_condition: str | None = None
    medical_history: str | None = None
    known_triggers: list[str] | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    notifications_enabled: bool | None = None
    data_sharing_consent: bool | None = None


# ---------------------------------------------------------------- mood
class MoodIn(In):
    mood_score: int = Field(ge=1, le=10)
    stress_level: int = Field(default=5, ge=1, le=10)
    anxiety_level: int | None = Field(default=None, ge=1, le=10)
    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    itch_level: int | None = Field(default=None, ge=0, le=10)
    emotions: list[str] = Field(default_factory=list, max_length=12)
    triggers: list[str] = Field(default_factory=list, max_length=12)
    note: str = Field(default="", max_length=2000)


# ---------------------------------------------------------------- skin
class QuestionnaireIn(In):
    answers: dict[str, object]


# ---------------------------------------------------------------- care
class MedicineIn(In):
    name: str = Field(min_length=1, max_length=160)
    dosage: str = "Standard application"
    timing: str = "Morning"
    frequency: str = "1x Daily"
    total_doses: int = Field(default=1, ge=1, le=12)
    area: str = ""
    refill_date: str = ""


class MedicineUpdate(In):
    name: str | None = None
    dosage: str | None = None
    timing: str | None = None
    frequency: str | None = None
    total_doses: int | None = Field(default=None, ge=1, le=12)
    area: str | None = None
    refill_date: str | None = None
    active: bool | None = None


class DoseIn(In):
    taken_doses: int = Field(ge=0, le=12)


class CareStepIn(In):
    category: str = "Assessment"
    title: str = Field(min_length=1, max_length=200)
    date_range: str = ""
    status: str = "Custom Plan"
    bullets: list[str] = Field(default_factory=list, max_length=10)


class CareStepUpdate(In):
    category: str | None = None
    title: str | None = None
    date_range: str | None = None
    status: str | None = None
    bullets: list[str] | None = None
    completed: bool | None = None


class AppointmentIn(In):
    doctor_id: int
    slot: str
    type: str = "Dermatological Review"
    report_attached: bool = True
    notes: str = ""


# ---------------------------------------------------------------- assistants
class ChatIn(In):
    message: str = Field(min_length=1, max_length=2000)


class VoiceTextIn(In):
    text: str = Field(min_length=1, max_length=2000)
    speak: bool = True
