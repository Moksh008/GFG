"""Reference data (providers) and an optional fully-populated demo account."""
from __future__ import annotations

import logging
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.entities import (
    Appointment, CareStep, Doctor, DoseLog, ImprovementRecord, Medicine, MoodLog, SkinDiagnosis, SkinImage, User,
)
from app.services import skin_knowledge
from app.utils.timefmt import today_utc

log = logging.getLogger("dermora.seed")

DOCTORS = [
    dict(name="Dr. Sarah Jenkins, MD", title="Board Certified Dermatologist", specialty="Clinical Dermatology & Oncology",
         department="Cutaneous Medicine", contact="+1 (555) 349-8201", email="s.jenkins@dermamed.org", rating=4.9, reviews=128,
         status="Available", avatar="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
         slots=["Today, 2:30 PM", "Tomorrow, 10:15 AM", "Friday, 4:00 PM"]),
    dict(name="Dr. Marcus Vance, DO", title="Dermatopathologist", specialty="Melanoma & Lesion Diagnostics",
         department="Pathology & Biopsy", contact="+1 (555) 782-9912", email="m.vance@dermapath.io", rating=4.8, reviews=94,
         status="Available", avatar="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
         slots=["Thursday, 11:00 AM", "Friday, 1:30 PM", "Next Mon, 9:00 AM"]),
    dict(name="Dr. Elena Rostova, MD", title="Pediatric & Inflammatory Derm", specialty="Atopic Eczema & Psoriasis",
         department="Immunology", contact="+1 (555) 441-2090", email="elena.rostova@skinclinic.com", rating=4.95, reviews=210,
         status="Absent", avatar="https://images.unsplash.com/photo-1594824813583-48a54d5d9c22?w=150&auto=format&fit=crop&q=80",
         slots=["Next Tue, 10:00 AM", "Next Wed, 3:30 PM"]),
    dict(name="Dr. Priya Raman, MD", title="Psychodermatologist", specialty="Stress-Linked Skin Disorders & Vitiligo",
         department="Psychodermatology", contact="+91 98450 22113", email="p.raman@mindskin.in", rating=4.85, reviews=76,
         status="Available", avatar="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80",
         slots=["Tomorrow, 5:00 PM", "Saturday, 11:30 AM"]),
]


def seed_reference_data(db: Session) -> None:
    if db.scalars(select(Doctor).limit(1)).first() is None:
        db.add_all(Doctor(**d) for d in DOCTORS)
        db.commit()
        log.info("Seeded %d providers", len(DOCTORS))


def seed_new_user(db: Session, user: User) -> None:
    """Starter care plan for every new account."""
    db.add_all([
        CareStep(user_id=user.id, category="Assessment", title="Baseline AI Skin Scan", date_range="This week",
                 status="Recommended", bullets=["Photograph the affected area in natural daylight", "Use the same angle for future scans"]),
        CareStep(user_id=user.id, category="Assessment", title="Daily Mood Check-in", date_range="Daily",
                 status="Ongoing", bullets=["Log mood, stress and sleep each evening", "Helps reveal your stress-skin triggers"]),
    ])


def seed_demo_user(db: Session) -> None:
    if db.scalars(select(User).where(User.email == settings.demo_email)).first():
        return
    now = datetime.now(timezone.utc)
    user = User(
        email=settings.demo_email, hashed_password=hash_password(settings.demo_password), full_name="Alex Mercer",
        skin_type="Fitzpatrick III", primary_condition="Eczema", known_triggers=["stress", "sweat", "dry weather"],
        latitude=28.6139, longitude=77.2090, date_of_birth="1998-04-12",
        medical_history="Atopic dermatitis since childhood; seasonal allergic rhinitis.",
    )
    db.add(user)
    db.flush()

    # --- scans (mirrors the dashboard's original mock data) -----------------
    scans_spec = [
        (30, "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80",
         68, 64, 3.8, 82, 62, "Elevated Risk", "Acute Contact Dermatitis & Lichenification", "Initial clinical baseline registered.", 0.88),
        (15, "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80",
         52, 45, 2.9, 88, 74, "Improving", "Moderate Papular Erythema", "Active flareup post-sun exposure, itching reported.", 0.84),
        (3, "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80",
         24, 28, 1.8, 94, 90, "Significant Improvement", "Mild Erythema / Resolving Contact Dermatitis",
         "Significant margin clearance, reduced scale thickness.", 0.79),
    ]
    diags = []
    for days_ago, url, sev, red, area, border, sym, status, result, notes, conf in scans_spec:
        ts = now - timedelta(days=days_ago, hours=3)
        img = SkinImage(user_id=user.id, storage_path=url, quality={"score": 90, "acceptable": True, "warnings": []}, created_at=ts)
        db.add(img)
        db.flush()
        probs = {"eczema": conf, "normal": round((1 - conf) * 0.5, 4), "psoriasis": round((1 - conf) * 0.4, 4), "vitiligo": round((1 - conf) * 0.1, 4)}
        d = SkinDiagnosis(
            user_id=user.id, image_id=img.id, body_area="Right Forearm (Epithelial)", notes=notes,
            predicted_label="eczema", confidence=conf, probabilities=probs, model_version="seed-demo",
            severity_score=sev, redness_index=red, area_cm2=area, border_regularity=border, symmetry=sym,
            status=status, ai_result=result,
            ai_summary=f"Pattern consistent with eczema; severity {sev}/100. " + skin_knowledge.info("eczema")["care"][0],
            questionnaire=skin_knowledge.questionnaire("eczema"), created_at=ts,
        )
        db.add(d)
        db.flush()
        diags.append(d)
    for prev, cur in zip(diags, diags[1:]):
        delta = cur.severity_score - prev.severity_score
        db.add(ImprovementRecord(
            user_id=user.id, baseline_diagnosis_id=prev.id, current_diagnosis_id=cur.id, body_area=cur.body_area,
            days_between=round((cur.created_at - prev.created_at).total_seconds() / 86400, 1), severity_delta=delta,
            redness_delta=cur.redness_index - prev.redness_index, area_delta_cm2=round(cur.area_cm2 - prev.area_cm2, 2),
            improvement_pct=round(-delta / prev.severity_score * 100, 1), trend="improving",
            analysis=(f"Your Right Forearm shows improvement: severity fell {abs(delta)} points, redness dropped "
                      f"{prev.redness_index - cur.redness_index}% and the affected area contracted by about "
                      f"{prev.area_cm2 - cur.area_cm2:.1f} cm². Keep following your current routine."),
            details={}, created_at=cur.created_at,
        ))

    # --- mood logs: stress tapering as skin improves ------------------------
    rng = random.Random(42)
    emotions_hi = [["stressed", "anxious"], ["frustrated", "tired"], ["embarrassed", "stressed"], ["overwhelmed"]]
    emotions_lo = [["calm"], ["hopeful", "relaxed"], ["content"], ["relieved", "calm"]]
    # 40 days so the oldest (30-day) scan also has a full week of preceding mood data.
    for day in range(40, 0, -1):
        if rng.random() < 0.15:
            continue
        progress = max(0.0, (30 - day) / 30)
        stress = max(1, min(10, round(8 - 5 * progress + rng.uniform(-1.2, 1.2))))
        mood = max(1, min(10, round(4 + 4.5 * progress + rng.uniform(-1, 1))))
        db.add(MoodLog(
            user_id=user.id, mood_score=mood, stress_level=stress, sleep_hours=round(5.5 + 2 * progress + rng.uniform(-0.7, 0.7), 1),
            itch_level=max(0, min(10, round(7 - 6 * progress + rng.uniform(-1, 1)))),
            emotions=rng.choice(emotions_hi if stress >= 6 else emotions_lo),
            triggers=rng.choice([["work deadline"], ["sweat"], ["poor sleep"], []]) if stress >= 6 else [],
            logged_at=now - timedelta(days=day, hours=rng.randint(0, 4)),
        ))

    # --- medications + adherence history ------------------------------------
    meds = [
        Medicine(user_id=user.id, name="Tacrolimus Ointment 0.1%", dosage="Thin layer", timing="Morning & Night",
                 frequency="2x Daily", doses_per_day=2, area="Right Forearm & Neck", refill_date="Dec 14, 2026"),
        Medicine(user_id=user.id, name="Desonide Cream 0.05%", dosage="Pea-sized amount", timing="Night before sleep",
                 frequency="1x Daily", doses_per_day=1, area="Left Deltoid lesion", refill_date="Jan 05, 2027"),
        Medicine(user_id=user.id, name="Cetirizine HCl 10mg", dosage="1 Oral tablet", timing="Evening with water",
                 frequency="1x Daily", doses_per_day=1, area="Systemic Antihistamine", refill_date="Dec 28, 2026"),
    ]
    db.add_all(meds)
    db.flush()
    today = today_utc()
    for m in meds:
        for back in range(1, 7):
            if rng.random() < 0.85:
                db.add(DoseLog(medicine_id=m.id, day=today - timedelta(days=back), doses_taken=m.doses_per_day))
    db.add(DoseLog(medicine_id=meds[0].id, day=today, doses_taken=2))
    db.add(DoseLog(medicine_id=meds[2].id, day=today, doses_taken=1))

    # --- care plan ------------------------------------------------------------
    steps = [
        ("Exercise", "Sweat-Trigger Barrier Care", "Active Days", "Recommended", ["Rinse within 15 min after cardio workouts", "Apply ceramide barrier cream"]),
        ("Nutrition", "Anti-Inflammatory Protocol", "Continuous", "Ongoing", ["Omega-3 2000mg + Evening Primrose", "Maintain hydration > 2.5L/day"]),
        ("Specialists", "Dr. Sarah Jenkins Consultation", "Dec 10, 2:30 PM", "Confirmed", ["Biopsy evaluation and dermoscopy review", "Bring full exported PDF summary"]),
        ("Testing", "Patch Allergen Series 40", "Dec 05 - Dec 07", "Scheduled", ["Avoid topical corticosteroids 48 hrs prior", "Clinic A - Room 302"]),
        ("Assessment", "Bi-Weekly AI Follow-up Scan", "Nov 28 - Dec 01", "Urgent", ["Capture clear focal shot under natural daylight", "Verify borders of forearm lesion"]),
    ]
    for i, (cat, title, rng_txt, status, bullets) in enumerate(steps):
        db.add(CareStep(user_id=user.id, category=cat, title=title, date_range=rng_txt, status=status, bullets=bullets,
                        created_at=now - timedelta(minutes=10 * (len(steps) - i))))

    jenkins = db.scalars(select(Doctor).where(Doctor.name.like("Dr. Sarah Jenkins%"))).first()
    db.add(Appointment(user_id=user.id, doctor_id=jenkins.id if jenkins else None, doctor_name="Dr. Sarah Jenkins, MD",
                       slot="Dec 10, 2026 at 2:30 PM", department="Cutaneous Medicine", type="In-Person Dermoscopy",
                       report_attached=True))
    db.commit()
    log.info("Seeded demo account %s", settings.demo_email)
