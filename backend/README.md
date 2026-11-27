# Dermora.ai — Backend (FastAPI)

Skin-condition detection (DINOv2 ViT-B/14), mood tracking, Solace voice companion, Aria assistant,
progress analytics, environmental intelligence and doctor-ready reports.

**Runs with zero keys**: SQLite + local fallbacks. Add `GEMINI_API_KEY` / `DATABASE_URL` to unlock the full stack.

## Quick start (Windows)

```powershell
cd backend
py -3.13 -m venv venv
venv\Scripts\activate
# CPU torch (or pick the CUDA build from pytorch.org for your GPU — ~20x faster scans)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
copy .env.example .env        # optional
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs (click **Authorize** → `alex@dermora.ai` / `dermora-demo`)
- Health: http://localhost:8000/health
- Model weights (~350 MB) download automatically from Hugging Face on first start.
- Frontend: `cd ../client && npm install && npm run dev` → http://localhost:5173 (use "Explore the demo account" on the login page).

Tests: `python -m pytest -q`

## Verifiable doctor reports (blockchain)

Every PDF from `GET /reports/pdf` gets a random report ID (printed with a QR code) and its
**SHA-256 fingerprint is anchored on-chain** by Dermora's issuer wallet via the
`DermoraReportRegistry` contract (`contracts/`). Doctors verify at `/verify` in the web app — the
browser hashes the file locally, so the PDF never leaves their device. **Only hashes go on-chain,
never patient data.**

| `WEB3_RPC_URL` | Behaviour |
|---|---|
| *(empty)* | Off — fingerprints stored in the DB only (verdict "Issued by Dermora") |
| `local` | In-process dev chain, contract auto-deployed. Resets on API restart (reports are re-anchored automatically) |
| `https://…` | Real network (e.g. Base Sepolia) — set up as below |

Go live on Base Sepolia (testnet, free):
```powershell
python scripts/deploy_registry.py wallet    # creates the issuer wallet in .env (prints its address)
# fund that address with Base Sepolia ETH: https://docs.base.org/base-chain/tools/network-faucets
python scripts/deploy_registry.py balance
python scripts/deploy_registry.py deploy    # deploys + writes WEB3_RPC_URL / REPORT_REGISTRY_ADDRESS to .env
```
Then restart the API; `/health` → `blockchain.network` shows "Base Sepolia" and transactions link to BaseScan.
Set `PUBLIC_APP_URL` to your deployed web app URL so QR codes point at the right verify page.

Endpoints: `GET /reports/issued` (patient's reports + on-chain status), public `GET /reports/verify?hash=`
and `GET /reports/verify/{reportId}`. Contract changes: edit the `.sol`, run `python scripts/compile_contract.py`.

### Troubleshooting
`ImportError: cannot import name 'ArgsKwargs' from 'pydantic_core._pydantic_core'` (or any error from a
compiled package) means the venv's interpreter and its installed packages are from different Python
versions — usually because `python -m venv venv` was re-run over an existing venv with a different
`python`. Check `venv\pyvenv.cfg`; if `version` isn't the one you installed with, stop the server,
`deactivate`, delete the `venv` folder and repeat the quick start. Never re-run `venv` over an existing one.

## The skin model

`rachitgoyell/dermora-dinov2-vit-b-skin` ships a raw state dict (no `config.json`), so the card's
`from_pretrained` snippet doesn't work. The architecture was reconstructed from the checkpoint and
verified on the dataset's held-out test images:

| | |
|---|---|
| Backbone | DINOv2 ViT-B/14 (timm `vit_base_patch14_dinov2`) |
| Head | Linear(768,512) → BN → ReLU → Dropout → Linear(512,256) → ReLU → Dropout → Linear(256,4) on CLS |
| Classes (index order) | `eczema, normal, psoriasis, vitiligo` |
| Input | **518×518**, ImageNet normalisation (224px loses ~15 pts accuracy) |
| Spot check | 47/48 correct on held-out test images |

Lesion metrics (redness, est. area cm², border regularity, symmetry) are computed from the photo with
CIELAB colour segmentation — they are tracking estimates, not calibrated clinical measurements.

## Endpoints

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register` `/auth/login` `/auth/refresh` `/auth/token` · `GET/PATCH/DELETE /auth/me` |
| Skin | `POST /skin/detect` · `GET /skin/history` `/skin/diagnosis/{id}` `/skin/compare` `/skin/progress` `/skin/conditions` · `POST /skin/diagnosis/{id}/questionnaire` · `DELETE /skin/diagnosis/{id}` |
| Mood | `POST /mood/log` · `GET /mood/history` `/mood/patterns` · `DELETE /mood/log/{id}` |
| Solace | `POST /voice/start-session` `/voice/process-audio` `/voice/session/{id}/message` `/voice/session/{id}/end` · `GET /voice/session/{id}` `/voice/sessions` `/voice/audio/...` · `WS /voice/live?token=` |
| Aria | `GET/DELETE /chat/history` · `POST /chat` |
| Analytics | `GET /analytics/dashboard` `/analytics/correlations` `/analytics/insights` `/analytics/trend` |
| Reports | `GET /reports/summary` `/reports/pdf` `/reports/issued` · public `GET /reports/verify?hash=` `/reports/verify/{id}` |
| Environment | `GET /weather/current?lat=&lon=` (Open-Meteo — no key needed) |
| Care | `/medicines` (+ `/toggle`, `/doses`) · `/care-plan` · `/doctors` · `/appointments` (+ `/cancel`) |

### What needs `GEMINI_API_KEY`
- **Required:** voice transcription (`/voice/process-audio`) and real-time voice (`WS /voice/live`).
- **Upgraded:** Aria/Solace replies, scan summaries, consultations, session analysis, insights
  (rule-based fallbacks are used without a key).

Model names are configurable (`GEMINI_MODEL`, `GEMINI_TTS_MODEL`, `GEMINI_LIVE_MODEL`) in case Google renames them.

### Real-time voice protocol (`WS /voice/live`)
Client sends binary PCM16 mono 16 kHz (or `{"type":"audio","data":b64}`), `{"type":"text"}`, `{"type":"end"}`.
Server sends `ready`, `audio` (PCM16 24 kHz, base64), `transcript`, `turn_complete`, `interrupted`, `safety`, `error`.

## Safety
Crisis language in mood notes, Aria chat or Solace sessions returns helpline resources (Tele-MANAS 14416,
KIRAN, 988, Samaritans) and flags the session; Solace switches to a crisis-aware prompt afterwards.
