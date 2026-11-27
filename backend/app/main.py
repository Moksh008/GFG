"""Dermora.ai API — dermatology x mental wellness."""
from __future__ import annotations

import logging
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import SessionLocal, init_db
from app.models.inference import classifier
from app.routers import analytics, auth, care, chat, mood, reports, skin, voice, weather
from app.services.gemini import gemini
from app.utils.seed import seed_demo_user, seed_reference_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("dermora")


def _warm_model() -> None:
    try:
        classifier.load()
    except Exception:
        pass  # error is recorded on the classifier and surfaced via /health


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    settings.audio_path.mkdir(parents=True, exist_ok=True)
    init_db()
    with SessionLocal() as db:
        seed_reference_data(db)
        if settings.seed_demo_data:
            seed_demo_user(db)
    # Load the 86M-param model in the background so startup is instant.
    threading.Thread(target=_warm_model, daemon=True).start()
    log.info("Database: %s", settings.resolved_database_url.split("@")[-1])
    if gemini.available:
        log.info("Gemini: enabled (models: %s; server TTS: %s; live voice: %s)", ", ".join(settings.gemini_model_chain),
                 settings.gemini_tts_model or "off", settings.gemini_live_model or "off")
    else:
        log.info("Gemini: disabled (set GEMINI_API_KEY) — using local fallbacks")
    yield


app = FastAPI(
    title="Dermora.ai API",
    version="0.1.0",
    description="Because your skin feels what you feel. Skin-condition detection, mood tracking, "
    "Solace voice therapy, progress analytics and environmental intelligence.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Skin images are stored under random UUID names.
settings.upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_path), name="uploads")

for r in (auth, skin, mood, voice, analytics, reports, weather, care, chat):
    app.include_router(r.router)


@app.get("/", tags=["meta"])
def root():
    return {"name": "Dermora.ai API", "docs": "/docs", "health": "/health"}


@app.get("/health", tags=["meta"])
def health():
    return {
        "status": "ok",
        "database": "postgres" if settings.resolved_database_url.startswith("postgresql") else "sqlite",
        "model": {
            "loaded": classifier.loaded,
            "error": classifier.error,
            "device": str(classifier.device),
            "classes": classifier.classes,
            "inputSize": classifier.size,
            "version": classifier.version,
        },
        "gemini": {
            "enabled": gemini.available,
            "models": settings.gemini_model_chain if gemini.available else [],
            "textToSpeech": gemini.tts_available,
            "realtime": gemini.live_available,
        },
        "azureVision": bool(settings.azure_vision_key and settings.azure_vision_endpoint),
    }
