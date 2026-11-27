import pytest

from tests.conftest import lesion_jpeg


# ------------------------------------------------------------------ meta / auth
def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["model"]["classes"] == ["eczema", "normal", "psoriasis", "vitiligo"]
    assert body["gemini"]["enabled"] is False


def test_auth_flow(client):
    r = client.post("/auth/register", json={"email": "New@Example.com", "password": "supersecret", "fullName": "New Person"})
    assert r.status_code == 201
    tokens = r.json()
    assert tokens["user"]["email"] == "new@example.com"

    assert client.post("/auth/register", json={"email": "new@example.com", "password": "supersecret"}).status_code == 409
    assert client.post("/auth/login", json={"email": "new@example.com", "password": "wrong-pass"}).status_code == 401
    assert client.post("/auth/register", json={"email": "short@example.com", "password": "123"}).status_code == 422

    h = {"Authorization": f"Bearer {tokens['access_token']}"}
    assert client.get("/auth/me", headers=h).json()["fullName"] == "New Person"
    r = client.patch("/auth/me", headers=h, json={"skinType": "Fitzpatrick IV", "latitude": 19.07, "longitude": 72.87})
    assert r.json()["skinType"] == "Fitzpatrick IV"

    r = client.post("/auth/refresh", json={"refreshToken": tokens["refresh_token"]})
    assert r.status_code == 200 and r.json()["access_token"]
    # access tokens can't be used as refresh tokens and vice versa
    assert client.post("/auth/refresh", json={"refreshToken": tokens["access_token"]}).status_code == 401
    assert client.get("/auth/me", headers={"Authorization": f"Bearer {tokens['refresh_token']}"}).status_code == 401

    # new users get a starter care plan
    assert len(client.get("/care-plan", headers=h).json()) == 2

    assert client.delete("/auth/me", headers=h).status_code == 204
    assert client.get("/auth/me", headers=h).status_code == 401


def test_requires_auth(client):
    for path in ("/skin/history", "/mood/history", "/medicines", "/analytics/dashboard", "/reports/summary"):
        assert client.get(path).status_code == 401


# ------------------------------------------------------------------ skin
def test_skin_detect_pipeline(client, auth):
    files = {"image": ("forearm.jpg", lesion_jpeg(redness=215, radius=150), "image/jpeg")}
    r = client.post("/skin/detect", headers=auth, files=files, data={"bodyArea": "Left Forearm", "notes": "itchy patch"})
    assert r.status_code == 200, r.text
    first = r.json()
    assert first["condition"] in ("eczema", "normal", "psoriasis", "vitiligo")
    assert abs(sum(first["probabilities"].values()) - 1) < 0.01
    assert 0 <= first["severityScore"] <= 100
    assert first["status"] in ("Baseline", "Elevated Risk")
    assert first["imageUrl"].startswith("http") and "/uploads/" in first["imageUrl"]
    assert first["questionnaire"] and first["conditionInfo"]["care"]
    assert "improvement" not in first
    # stored image is retrievable
    path = first["imageUrl"].split("://", 1)[1].split("/", 1)[1]
    assert client.get("/" + path).status_code == 200

    # second scan of same area (smaller, less red) -> improvement record
    files = {"image": ("forearm2.jpg", lesion_jpeg(redness=185, radius=80, seed=1), "image/jpeg")}
    r = client.post("/skin/detect", headers=auth, files=files, data={"bodyArea": "left forearm"})
    assert r.status_code == 200
    second = r.json()
    assert second["improvement"]["baselineScanId"] == first["id"]
    assert second["improvement"]["trend"] in ("improving", "stable", "worsening")
    assert second["improvement"]["analysis"]

    hist = client.get("/skin/history", headers=auth).json()
    assert [s["id"] for s in hist[:2]] == [second["id"], first["id"]]

    # questionnaire -> consultation
    r = client.post(f"/skin/diagnosis/{second['id']}/questionnaire", headers=auth,
                    json={"answers": {"stress": 8, "duration": "1-4 weeks", "bogus": 1}})
    assert r.status_code == 200
    consult = r.json()["consultation"]
    assert consult["urgency"] in ("routine", "soon", "urgent") and consult["recommendations"]
    assert "bogus" not in r.json()["questionnaireAnswers"]

    cmp = client.get("/skin/compare", headers=auth).json()
    assert cmp["baseline"]["id"] == first["id"] and cmp["current"]["id"] == second["id"]

    prog = client.get("/skin/progress", headers=auth, params={"bodyArea": "Left Forearm"}).json()
    assert len(prog["series"]) == 2 and prog["overall"] is not None

    assert client.get(f"/skin/diagnosis/{first['id']}", headers=auth).status_code == 200


def test_skin_rejects_bad_input(client, auth):
    r = client.post("/skin/detect", headers=auth, files={"image": ("x.txt", b"hello", "text/plain")})
    assert r.status_code == 415
    r = client.post("/skin/detect", headers=auth, files={"image": ("x.jpg", b"not really a jpeg", "image/jpeg")})
    assert r.status_code == 400


def test_skin_isolation_and_delete(client, auth, other_auth):
    files = {"image": ("a.jpg", lesion_jpeg(seed=3), "image/jpeg")}
    d = client.post("/skin/detect", headers=auth, files=files, data={"bodyArea": "Neck"}).json()
    assert client.get(f"/skin/diagnosis/{d['id']}", headers=other_auth).status_code == 404
    assert client.delete(f"/skin/diagnosis/{d['id']}", headers=other_auth).status_code == 404
    assert client.delete(f"/skin/diagnosis/{d['id']}", headers=auth).status_code == 204
    assert client.get(f"/skin/diagnosis/{d['id']}", headers=auth).status_code == 404


# ------------------------------------------------------------------ mood & analytics
def test_mood_and_correlations(client, auth):
    for mood, stress in [(3, 8), (5, 6), (7, 3)]:
        r = client.post("/mood/log", headers=auth, json={"moodScore": mood, "stressLevel": stress, "sleepHours": 6,
                                                         "emotions": ["Anxious"], "note": "feeling stressed and itchy"})
        assert r.status_code == 201
        assert r.json()["emotions"] == ["anxious"]
        assert r.json()["sentiment"] < 0
    assert client.post("/mood/log", headers=auth, json={"moodScore": 11}).status_code == 422
    r = client.post("/mood/log", headers=auth, json={"moodScore": 2, "note": "I want to die"})
    assert r.json()["support"]["helplines"]

    assert len(client.get("/mood/history", headers=auth).json()) == 4
    p = client.get("/mood/patterns", headers=auth).json()
    assert p["count"] == 4 and p["averageMood"] is not None and p["streakDays"] >= 1

    c = client.get("/analytics/correlations", headers=auth).json()
    assert "stressVsSeverity" in c and c["findings"]


def test_demo_dashboard(client, demo_auth):
    d = client.get("/analytics/dashboard", headers=demo_auth).json()
    assert d["scansCount"] == 3
    assert d["medsTotal"] == 3 and d["medsTakenToday"] == 2
    assert d["latestScan"]["severityScore"] == 24 and d["latestScan"]["severityChange"] == -28
    assert d["upcomingAppointments"] == 1

    scans = client.get("/skin/history", headers=demo_auth).json()
    assert scans[0]["status"] == "Significant Improvement"
    assert scans[0]["imageUrl"].startswith("https://images.unsplash.com")
    assert scans[0]["borderRegularity"] == "94% Regular"

    c = client.get("/analytics/correlations", headers=demo_auth).json()
    assert c["stressVsSeverity"]["r"] is not None and c["stressVsSeverity"]["r"] > 0.5

    ins = client.get("/analytics/insights", headers=demo_auth).json()
    assert ins["summary"] and ins["insights"]
    assert len(client.get("/analytics/trend", headers=demo_auth).json()) == 3


# ------------------------------------------------------------------ care
def test_medicines(client, auth):
    m = client.post("/medicines", headers=auth, json={"name": "Clobetasol 0.05%", "totalDoses": 2, "timing": "Bedtime"}).json()
    assert m["takenToday"] is False and m["totalDoses"] == 2
    m = client.post(f"/medicines/{m['id']}/toggle", headers=auth).json()
    assert m["takenToday"] is True and m["takenDoses"] == 2
    m = client.put(f"/medicines/{m['id']}/doses", headers=auth, json={"takenDoses": 1}).json()
    assert m["takenToday"] is False and m["takenDoses"] == 1
    lst = client.get("/medicines", headers=auth).json()
    assert len(lst["medicines"]) == 1 and lst["adherence7d"] is not None
    assert client.patch(f"/medicines/{m['id']}", headers=auth, json={"dosage": "Thin film"}).json()["dosage"] == "Thin film"
    assert client.delete(f"/medicines/{m['id']}", headers=auth).status_code == 204


def test_care_plan(client, auth):
    s = client.post("/care-plan", headers=auth, json={"title": "SPF Protocol", "category": "Nutrition", "dateRange": "Daily"}).json()
    assert s["bullets"] and s["status"] == "Custom Plan"
    assert client.patch(f"/care-plan/{s['id']}", headers=auth, json={"completed": True}).json()["completed"] is True
    assert client.get("/care-plan", headers=auth).json()[0]["id"] == s["id"]
    assert client.delete(f"/care-plan/{s['id']}", headers=auth).status_code == 204


def test_appointments(client, auth, other_auth):
    docs = client.get("/doctors", headers=auth).json()
    assert len(docs) >= 3
    avail = next(d for d in docs if d["status"] == "Available")
    absent = next(d for d in docs if d["status"] != "Available")
    slot = avail["slots"][-1]
    a = client.post("/appointments", headers=auth, json={"doctorId": avail["id"], "slot": slot})
    assert a.status_code == 201 and a.json()["doctor"] == avail["name"]
    assert client.post("/appointments", headers=other_auth, json={"doctorId": avail["id"], "slot": slot}).status_code == 409
    assert client.post("/appointments", headers=auth, json={"doctorId": avail["id"], "slot": "Never"}).status_code == 409
    assert client.post("/appointments", headers=auth, json={"doctorId": absent["id"], "slot": absent["slots"][0]}).status_code == 409
    c = client.post(f"/appointments/{a.json()['id']}/cancel", headers=auth).json()
    assert c["status"] == "cancelled"
    # slot frees up after cancellation
    assert client.post("/appointments", headers=other_auth, json={"doctorId": avail["id"], "slot": slot}).status_code == 201


# ------------------------------------------------------------------ assistants
def test_aria_chat(client, demo_auth):
    h = client.get("/chat/history", headers=demo_auth).json()["messages"]
    assert h[0]["sender"] == "aria" and "Alex" in h[0]["text"]
    r = client.post("/chat", headers=demo_auth, json={"message": "Why is it itchy?"}).json()
    assert r["message"]["sender"] == "aria" and r["message"]["text"]
    assert r["aiPowered"] is False
    r = client.post("/chat", headers=demo_auth, json={"message": "Is my skin improving?"}).json()
    assert "improvement" in r["message"]["text"].lower() or "severity" in r["message"]["text"].lower()
    r = client.post("/chat", headers=demo_auth, json={"message": "Did I take my meds today?"}).json()
    assert "Desonide" in r["message"]["text"]  # the one dose still pending in demo data
    r = client.post("/chat", headers=demo_auth, json={"message": "I want to kill myself"}).json()
    assert r["safety"] and r["safety"]["helplines"]
    assert len(client.get("/chat/history", headers=demo_auth).json()["messages"]) == 8


def test_solace_text_session(client, demo_auth):
    s = client.post("/voice/start-session", headers=demo_auth, params={"speak": "false"}).json()
    assert s["greeting"].startswith("Hi Alex") and s["messages"][0]["role"] == "agent"
    assert s["capabilities"]["realtime"] is False

    r = client.post(f"/voice/session/{s['id']}/message", headers=demo_auth,
                    json={"text": "Work stress has been awful and I keep scratching", "speak": False}).json()
    assert r["reply"] and r["audioBase64"] is None
    r = client.post(f"/voice/session/{s['id']}/message", headers=demo_auth,
                    json={"text": "I feel a bit better after talking, more hopeful", "speak": False})
    assert r.status_code == 200

    # audio transcription needs Gemini
    r = client.post("/voice/process-audio", headers=demo_auth, data={"sessionId": s["id"]},
                    files={"audio": ("a.webm", b"\x1aE\xdf\xa3", "audio/webm")})
    assert r.status_code == 503

    before = len(client.get("/mood/history", headers=demo_auth).json())
    e = client.post(f"/voice/session/{s['id']}/end", headers=demo_auth).json()
    assert e["status"] == "ended" and e["summary"] and e["insights"] and e["postMoodScore"] is not None
    assert len(client.get("/mood/history", headers=demo_auth).json()) == before + 1
    assert client.post(f"/voice/session/{s['id']}/message", headers=demo_auth, json={"text": "hi"}).status_code == 409
    assert client.get(f"/voice/session/{s['id']}", headers=demo_auth).json()["messages"]
    assert client.get("/voice/sessions", headers=demo_auth).json()[0]["id"] == s["id"]


def test_live_ws_requires_gemini(client, demo_auth):
    token = demo_auth["Authorization"].split()[1]
    with client.websocket_connect(f"/voice/live?token={token}") as ws:
        assert "GEMINI_API_KEY" in ws.receive_json()["message"]
    with client.websocket_connect("/voice/live?token=garbage") as ws:
        assert ws.receive_json()["message"] == "Unauthorized"


# ------------------------------------------------------------------ reports & weather
def test_reports(client, demo_auth):
    s = client.get("/reports/summary", headers=demo_auth).json()
    assert s["patient"]["name"] == "Alex Mercer" and len(s["scans"]) == 3 and s["medications"]
    r = client.get("/reports/pdf", headers=demo_auth)
    assert r.status_code == 200 and r.content.startswith(b"%PDF") and len(r.content) > 1500


def test_weather(client, demo_auth, monkeypatch):
    from app.services import weather_service

    fake = {"weather": {"timezone": "Asia/Kolkata", "current": {
        "temperature_2m": 31, "relative_humidity_2m": 28, "apparent_temperature": 33, "uv_index": 9,
        "wind_speed_10m": 7, "weather_code": 0, "precipitation": 0, "time": "2026-11-27T12:00"},
        "daily": {"uv_index_max": [9.5]}}, "air": {"us_aqi": 160, "pm2_5": 70, "pm10": 120}}
    monkeypatch.setattr(weather_service, "_fetch", lambda lat, lon: fake)
    weather_service._cache.clear()
    w = client.get("/weather/current", headers=demo_auth).json()  # uses profile location
    assert w["uvIndex"] == 9 and w["condition"] == "Clear sky"
    assert w["skinRisk"]["level"] == "high" and len(w["recommendations"]) >= 3


def test_weather_needs_location(client, auth):
    assert client.get("/weather/current", headers=auth).status_code == 422
