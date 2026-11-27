# Dermora.ai

**Because your skin feels what you feel.** A platform connecting dermatology and mental wellbeing:
AI skin-condition detection, mood tracking, the Solace voice companion, progress analytics and
environmental intelligence.

```
.
├── client/    React 19 + Vite + Tailwind v4 web app (landing page + signed-in app)
└── backend/   FastAPI API, DINOv2 skin model, SQLite/NeonDB, report-registry smart contract
               → see backend/README.md
```

## Run it locally

**1. API** (first run downloads the ~350 MB model automatically)

```powershell
cd backend
py -3.13 -m venv venv; venv\Scripts\activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**2. Web app**

```powershell
cd client
npm install
npm run dev        # http://localhost:5173
```

Open http://localhost:5173, click **Login → Explore the demo account** (`alex@dermora.ai` / `dermora-demo`),
or register a new account. No API keys are needed to run; add `GEMINI_API_KEY` to `backend/.env` to enable
voice input and AI-written responses (see `backend/.env.example`).

## App pages

| Route | What it does |
|---|---|
| `/` | Landing page |
| `/login`, `/register` | Auth (JWT with automatic refresh) |
| `/dashboard` | Skin trend, lesion change, medications, care plan, providers & booking, Aria chat, mood check-in, weather, Solace |
| `/scans` | Scan history, per-area severity chart, scan detail, questionnaire → consultation, compare, delete |
| `/mind` | Mood journal, 30-day patterns, mood/stress charts, mind↔skin correlations |
| `/solace` | Voice/text sessions with Solace, spoken replies, session summaries |
| `/insights` | AI overview, correlations, environment, verifiable PDF report + on-chain status, appointments |
| `/verify`, `/verify/:id` | **Public** — doctors check a report PDF is authentic (blockchain-anchored SHA-256) |

## Client structure

```
client/src/
├── api/            http.js (fetch, JWT storage, refresh) + index.js (authApi, skinApi, moodApi, …)
├── context/        AuthProvider, ToastProvider
├── hooks/          useAuth, useToast, useAsync, useDashboardData, useSolaceSession,
│                   useAudioRecorder, useWeather, useReportExport
├── components/
│   ├── ui/         Modal, LineChart, Feedback (Spinner, EmptyState, ErrorBanner, SafetyNotice), classes
│   ├── layout/     AppShell, AppHeader, ProtectedRoute
│   ├── dashboard/  dashboard cards
│   ├── modals/     Scan, Compare, Book, Medicine, Plan
│   ├── scans/      ScanResult, QuestionnaireForm, ConsultationCard, ScanDetailModal
│   ├── mind/       MoodForm, CorrelationCard
│   └── landing/    landing-page scenes, sections and characters
├── pages/          one file per route
└── utils/          format.js
```

Frontend config: `client/.env.example` (`VITE_API_URL`, demo credentials).
