import io
import os
import sys
import tempfile
from pathlib import Path

import numpy as np
import pytest
from PIL import Image, ImageDraw, ImageFilter

_tmp = Path(tempfile.mkdtemp(prefix="dermora-test-"))
os.environ.update({
    "DATABASE_URL": f"sqlite:///{(_tmp / 'test.db').as_posix()}",
    "UPLOAD_DIR": str(_tmp / "uploads"),
    "AUDIO_DIR": str(_tmp / "audio"),
    "GEMINI_API_KEY": "",  # force deterministic local fallbacks
    "AZURE_VISION_KEY": "",
    "SEED_DEMO_DATA": "true",
    "SECRET_KEY": "test-secret-key-that-is-long-enough-for-hs256",
    "WEB3_RPC_URL": "local",  # in-process dev chain with the registry auto-deployed
    "WEB3_PRIVATE_KEY": "",
    "REPORT_REGISTRY_ADDRESS": "",
    "PUBLIC_APP_URL": "http://dermora.test",
})
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def _auth(client, email, password="password123", name="Test User"):
    r = client.post("/auth/register", json={"email": email, "password": password, "fullName": name})
    if r.status_code == 409:
        r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code in (200, 201), r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture(scope="session")
def auth(client):
    return _auth(client, "tester@example.com")


@pytest.fixture(scope="session")
def other_auth(client):
    return _auth(client, "intruder@example.com")


@pytest.fixture(scope="session")
def demo_auth(client):
    r = client.post("/auth/login", json={"email": "alex@dermora.ai", "password": "dermora-demo"})
    assert r.status_code == 200, r.text
    headers = {"Authorization": f"Bearer {r.json()['access_token']}"}
    # The demo account starts empty; fill it the same way the app's "Fill demo data" button does.
    assert client.get("/demo/status", headers=headers).json()["hasData"] is False
    assert client.post("/demo/seed", headers=headers).status_code == 201
    return headers


def lesion_jpeg(redness: int = 200, radius: int = 120, seed: int = 0) -> bytes:
    """Synthetic skin photo with an erythematous patch."""
    rng = np.random.default_rng(seed)
    base = np.full((480, 640, 3), (214, 168, 140), dtype=np.float32) + rng.normal(0, 5, (480, 640, 3))
    img = Image.fromarray(np.clip(base, 0, 255).astype("uint8"))
    d = ImageDraw.Draw(img)
    cx, cy = 320, 240
    d.ellipse([cx - radius, cy - int(radius * 0.8), cx + radius, cy + int(radius * 0.8)], fill=(redness, 90, 85))
    img = img.filter(ImageFilter.GaussianBlur(3))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    return buf.getvalue()
