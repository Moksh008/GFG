"""Local file storage for skin images and voice audio (random, unguessable names)."""
from __future__ import annotations

import hashlib
import shutil
import uuid
from pathlib import Path

from app.core.config import settings

IMAGE_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/heic": ".heic", "image/heif": ".heif"}


def save_image(user_id: int, data: bytes, content_type: str) -> tuple[str, str]:
    """Return (relative storage path, sha256)."""
    ext = IMAGE_TYPES.get(content_type, ".jpg")
    rel = Path(str(user_id)) / f"{uuid.uuid4().hex}{ext}"
    dest = settings.upload_path / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return rel.as_posix(), hashlib.sha256(data).hexdigest()


def save_audio(user_id: int, data: bytes, ext: str) -> str:
    rel = Path(str(user_id)) / f"{uuid.uuid4().hex}{ext}"
    dest = settings.audio_path / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return rel.as_posix()


def delete_image(rel: str) -> None:
    if rel.startswith(("http://", "https://")):
        return
    (settings.upload_path / rel).unlink(missing_ok=True)


def delete_user_files(user_id: int) -> None:
    for root in (settings.upload_path, settings.audio_path):
        shutil.rmtree(root / str(user_id), ignore_errors=True)
