"""Medications, care plan, providers and appointments for the dashboard."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.entities import Appointment, CareStep, Doctor, DoseLog, Medicine, User
from app.schemas.requests import AppointmentIn, CareStepIn, CareStepUpdate, DoseIn, MedicineIn, MedicineUpdate
from app.schemas.serializers import appointment_out, care_step_out, doctor_out, medicine_out
from app.services.patient_context import adherence, doses_today
from app.utils.timefmt import today_utc

router = APIRouter(tags=["care"])


# ================================================================ medicines
def _owned_med(db: Session, user: User, med_id: int) -> Medicine:
    m = db.get(Medicine, med_id)
    if not m or m.user_id != user.id:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return m


def _set_doses(db: Session, med: Medicine, n: int) -> int:
    n = max(0, min(n, med.doses_per_day))
    log = db.scalars(select(DoseLog).where(DoseLog.medicine_id == med.id, DoseLog.day == today_utc())).first()
    if log is None:
        log = DoseLog(medicine_id=med.id, day=today_utc(), doses_taken=n)
        db.add(log)
    else:
        log.doses_taken = n
    return n


@router.get("/medicines")
def list_medicines(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    meds = list(db.scalars(select(Medicine).where(Medicine.user_id == user.id, Medicine.active.is_(True)).order_by(Medicine.id)))
    today = doses_today(db, [m.id for m in meds])
    return {
        "medicines": [medicine_out(m, today.get(m.id, 0)) for m in meds],
        "adherence7d": adherence(db, meds),
    }


@router.post("/medicines", status_code=201)
def add_medicine(body: MedicineIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    m = Medicine(
        user_id=user.id, name=body.name.strip(), dosage=body.dosage, timing=body.timing, frequency=body.frequency,
        doses_per_day=body.total_doses, area=body.area, refill_date=body.refill_date,
    )
    db.add(m)
    db.commit()
    return medicine_out(m, 0)


@router.patch("/medicines/{med_id}")
def update_medicine(med_id: int, body: MedicineUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    m = _owned_med(db, user, med_id)
    data = body.model_dump(exclude_unset=True)
    if "total_doses" in data:
        m.doses_per_day = data.pop("total_doses")
    for k, v in data.items():
        setattr(m, k, v)
    db.commit()
    return medicine_out(m, doses_today(db, [m.id]).get(m.id, 0))


@router.delete("/medicines/{med_id}", status_code=204)
def delete_medicine(med_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(_owned_med(db, user, med_id))
    db.commit()


@router.post("/medicines/{med_id}/toggle", summary="Toggle today's doses between all-taken and none")
def toggle_medicine(med_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    m = _owned_med(db, user, med_id)
    taken = doses_today(db, [m.id]).get(m.id, 0)
    n = _set_doses(db, m, 0 if taken >= m.doses_per_day else m.doses_per_day)
    db.commit()
    return medicine_out(m, n)


@router.put("/medicines/{med_id}/doses", summary="Set the number of doses taken today")
def set_doses(med_id: int, body: DoseIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    m = _owned_med(db, user, med_id)
    n = _set_doses(db, m, body.taken_doses)
    db.commit()
    return medicine_out(m, n)


# ================================================================ care plan
def _owned_step(db: Session, user: User, step_id: int) -> CareStep:
    s = db.get(CareStep, step_id)
    if not s or s.user_id != user.id:
        raise HTTPException(status_code=404, detail="Care step not found")
    return s


@router.get("/care-plan")
def list_steps(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    steps = db.scalars(select(CareStep).where(CareStep.user_id == user.id).order_by(CareStep.created_at.desc(), CareStep.id.desc()))
    return [care_step_out(s) for s in steps]


@router.post("/care-plan", status_code=201)
def add_step(body: CareStepIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bullets = [b.strip() for b in body.bullets if b.strip()] or ["Routine monitoring checklist", "Review symptoms with clinician"]
    s = CareStep(user_id=user.id, category=body.category, title=body.title.strip(), date_range=body.date_range,
                 status=body.status, bullets=bullets)
    db.add(s)
    db.commit()
    return care_step_out(s)


@router.patch("/care-plan/{step_id}")
def update_step(step_id: int, body: CareStepUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = _owned_step(db, user, step_id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    return care_step_out(s)


@router.delete("/care-plan/{step_id}", status_code=204)
def delete_step(step_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(_owned_step(db, user, step_id))
    db.commit()


# ================================================================ doctors & appointments
@router.get("/doctors")
def list_doctors(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [doctor_out(d) for d in db.scalars(select(Doctor).order_by(Doctor.id))]


@router.get("/appointments")
def list_appointments(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    apts = db.scalars(select(Appointment).where(Appointment.user_id == user.id).order_by(Appointment.created_at.desc(), Appointment.id.desc()))
    return [appointment_out(a) for a in apts]


@router.post("/appointments", status_code=201)
def book(body: AppointmentIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.get(Doctor, body.doctor_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if doc.status != "Available":
        raise HTTPException(status_code=409, detail=f"{doc.name} is not currently accepting bookings")
    if body.slot not in (doc.slots or []):
        raise HTTPException(status_code=409, detail="That slot is no longer available")
    clash = db.scalars(select(Appointment).where(
        Appointment.doctor_id == doc.id, Appointment.slot == body.slot, Appointment.status == "confirmed"
    )).first()
    if clash:
        raise HTTPException(status_code=409, detail="That slot has just been booked")
    a = Appointment(user_id=user.id, doctor_id=doc.id, doctor_name=doc.name, slot=body.slot, department=doc.department,
                    type=body.type, report_attached=body.report_attached, notes=body.notes)
    db.add(a)
    db.commit()
    return appointment_out(a)


@router.post("/appointments/{apt_id}/cancel")
def cancel(apt_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = db.get(Appointment, apt_id)
    if not a or a.user_id != user.id:
        raise HTTPException(status_code=404, detail="Appointment not found")
    a.status = "cancelled"
    db.commit()
    return appointment_out(a)
