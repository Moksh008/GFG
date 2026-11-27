"""Application configuration loaded from environment variables / backend/.env."""
from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
log = logging.getLogger("dermora.config")

_DEV_SECRET = "dev-insecure-secret-change-me"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- Database -----------------------------------------------------------
    # DATABASE_URL wins; NEONDB_CONNECTION_STRING is accepted as an alias.
    # With neither set, a local SQLite file is used so the API runs with zero setup.
    database_url: str | None = None
    neondb_connection_string: str | None = None

    # --- AI services --------------------------------------------------------
    gemini_api_key: str | None = None
    # Comma-separated, tried in order; later models are fallbacks for overload/rate limits.
    gemini_model: str = "gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.5-flash"
    gemini_timeout_seconds: int = 30
    # Optional: leave empty when your key has no TTS / Live model (the web app then uses
    # the browser's built-in voice for spoken replies, and real-time voice is disabled).
    gemini_tts_model: str = ""
    gemini_tts_voice: str = "Kore"
    gemini_live_model: str = ""
    azure_vision_key: str | None = None
    azure_vision_endpoint: str | None = None

    # --- Blockchain report verification ----------------------------------------
    # WEB3_RPC_URL: "" = off (hashes kept in DB only) | "local" = in-process dev chain
    #               (auto-deployed, resets on restart) | https://… = real network
    web3_rpc_url: str = ""
    web3_private_key: str = ""  # Dermora issuer wallet that pays gas to anchor reports
    report_registry_address: str = ""  # deployed DermoraReportRegistry (scripts/deploy_registry.py)
    web3_network_name: str = ""  # display name, e.g. "Base Sepolia"
    web3_explorer_url: str = ""  # e.g. https://sepolia.basescan.org
    web3_confirm_timeout_seconds: int = 120
    # Public URL of the web app — printed (and QR-encoded) in PDFs for verification links.
    public_app_url: str = "http://localhost:5173"

    # --- Weather: Open-Meteo (free, no API key required) ---------------------
    weather_cache_minutes: int = 10

    # --- Skin model -----------------------------------------------------------
    model_path: str = "app/models/weights/dermora-dinov2-vit-b-skin-improved.pth"
    model_hf_repo: str = "rachitgoyell/dermora-dinov2-vit-b-skin"
    model_hf_filename: str = "dermora-dinov2-vit-b-skin-improved.pth"
    model_auto_download: bool = True
    # Comma-separated class names in the checkpoint's output order. Verified against
    # labelled images from rachitgoyell/dermoraSkinStressDataset (test split).
    model_classes: str = "eczema,normal,psoriasis,vitiligo"
    # The checkpoint was trained at 518px (DINOv2's native grid); 224 loses ~15pts accuracy.
    model_input_size: int = 518
    model_device: str = "auto"  # auto | cpu | cuda
    # Approximate real-world width (cm) of a typical close-up photo, used to
    # convert lesion pixel area into an estimated cm² value.
    field_of_view_cm: float = 8.0

    # --- Security -------------------------------------------------------------
    secret_key: str = _DEV_SECRET
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # --- Storage / server -----------------------------------------------------
    upload_dir: str = "uploads/skin_images"
    audio_dir: str = "convo_audios"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,capacitor://localhost,http://localhost"
    seed_demo_data: bool = True
    demo_email: str = "alex@dermora.ai"
    demo_password: str = "dermora-demo"
    max_upload_mb: int = 10

    @property
    def resolved_database_url(self) -> str:
        url = self.database_url or self.neondb_connection_string
        if not url:
            return f"sqlite:///{(BACKEND_DIR / 'dermora.db').as_posix()}"
        # Normalise to the psycopg (v3) driver for Postgres / NeonDB.
        for prefix in ("postgres://", "postgresql://"):
            if url.startswith(prefix):
                return "postgresql+psycopg://" + url[len(prefix):]
        return url

    @property
    def gemini_model_chain(self) -> list[str]:
        return [m.strip() for m in self.gemini_model.split(",") if m.strip()]

    @property
    def class_names(self) -> list[str]:
        return [c.strip() for c in self.model_classes.split(",") if c.strip()]

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    def abs_path(self, p: str) -> Path:
        path = Path(p)
        return path if path.is_absolute() else BACKEND_DIR / path

    @property
    def upload_path(self) -> Path:
        return self.abs_path(self.upload_dir)

    @property
    def audio_path(self) -> Path:
        return self.abs_path(self.audio_dir)

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.gemini_api_key)


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    if s.secret_key in (_DEV_SECRET, "change-me"):
        log.warning("SECRET_KEY not set — using an insecure development secret.")
    return s


settings = get_settings()
