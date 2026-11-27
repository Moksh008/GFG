from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.entities import SkinDiagnosis, User
from app.services.weather_service import current_conditions

router = APIRouter(prefix="/weather", tags=["environment"])


@router.get("/current", summary="Current weather, UV, air quality and skin-risk advice")
def current(
    lat: float | None = Query(None, ge=-90, le=90),
    lon: float | None = Query(None, ge=-180, le=180),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lat = lat if lat is not None else user.latitude
    lon = lon if lon is not None else user.longitude
    if lat is None or lon is None:
        raise HTTPException(status_code=422, detail="Provide lat & lon, or save a location in your profile (PATCH /auth/me)")
    latest = db.scalars(
        select(SkinDiagnosis).where(SkinDiagnosis.user_id == user.id).order_by(SkinDiagnosis.created_at.desc())
    ).first()
    return current_conditions(lat, lon, latest.predicted_label if latest else None)
