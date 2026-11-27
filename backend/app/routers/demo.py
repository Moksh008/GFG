"""Demo data controls: the app ships with no mock data; users opt in with a button."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.entities import User
from app.utils.seed import clear_user_data, has_health_data, populate_demo_data, seed_new_user

router = APIRouter(prefix="/demo", tags=["demo"])


@router.get("/status", summary="Whether the signed-in account has any health data yet")
def status(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"hasData": has_health_data(db, user)}


@router.post("/seed", status_code=201, summary="Fill the signed-in account with a month of sample data")
def seed(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if has_health_data(db, user):
        raise HTTPException(status_code=409, detail="Your account already has data. Reset it first to load the demo.")
    clear_user_data(db, user)  # drop the starter care plan so the demo plan replaces it
    populate_demo_data(db, user)
    return {"hasData": True}


@router.delete("/data", summary="Erase the signed-in account's health records (scans, mood, meds, plan, visits)")
def reset(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clear_user_data(db, user)
    seed_new_user(db, user)
    db.commit()
    return {"hasData": False}
