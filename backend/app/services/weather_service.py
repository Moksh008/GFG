"""Environmental intelligence via Open-Meteo (weather + air quality, no API key needed)."""
from __future__ import annotations

import logging
import time

import httpx
from fastapi import HTTPException

from app.core.config import settings

log = logging.getLogger("dermora.weather")

_cache: dict[tuple, tuple[float, dict]] = {}

WEATHER_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Rime fog",
    51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
    71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Violent showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail",
}


def _fetch(lat: float, lon: float) -> dict:
    with httpx.Client(timeout=8) as client:
        w = client.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat, "longitude": lon, "timezone": "auto",
                "current": "temperature_2m,relative_humidity_2m,apparent_temperature,uv_index,wind_speed_10m,weather_code,precipitation",
                "daily": "uv_index_max,temperature_2m_max,temperature_2m_min",
                "forecast_days": 1,
            },
        )
        w.raise_for_status()
        aq = None
        try:
            a = client.get(
                "https://air-quality-api.open-meteo.com/v1/air-quality",
                params={"latitude": lat, "longitude": lon, "current": "pm2_5,pm10,us_aqi"},
            )
            a.raise_for_status()
            aq = a.json().get("current")
        except Exception:
            log.warning("Air-quality lookup failed", exc_info=True)
    return {"weather": w.json(), "air": aq}


def _risk_level(score: int) -> str:
    return "high" if score >= 6 else "moderate" if score >= 3 else "low"


def skin_advice(temp: float, humidity: float, uv: float, aqi: float | None, condition: str | None) -> tuple[int, list[str]]:
    advice: list[str] = []
    score = 0
    if humidity < 35:
        score += 3 if condition == "eczema" else 2
        advice.append("Low humidity dries the skin barrier — moisturise more often and consider a humidifier indoors.")
    elif humidity > 75:
        score += 2 if condition == "eczema" else 1
        advice.append("High humidity increases sweat — rinse and re-moisturise after sweating.")
    if uv >= 8:
        score += 3
        advice.append("Very high UV — seek shade 11am-4pm and use SPF 50+; depigmented and treated skin burns easily.")
    elif uv >= 6:
        score += 2
        advice.append("High UV — apply broad-spectrum SPF 30+ and reapply every 2 hours outdoors.")
    elif uv >= 3 and condition == "psoriasis":
        advice.append("Moderate UV — brief, sensible sun exposure can benefit psoriasis; avoid burning.")
    if temp <= 8:
        score += 2
        advice.append("Cold air can trigger flares — cover exposed skin and use a richer ointment.")
    elif temp >= 32:
        score += 2
        advice.append("Heat can trigger itching — wear loose cotton and keep skin cool.")
    if aqi is not None and aqi > 100:
        score += 2
        advice.append("Poor air quality — pollutants can aggravate inflammation; cleanse skin gently in the evening.")
    if not advice:
        advice.append("Conditions are skin-friendly today — keep up your usual routine.")
    return min(score, 10), advice


def current_conditions(lat: float, lon: float, condition: str | None = None) -> dict:
    key = (round(lat, 2), round(lon, 2))
    now = time.time()
    cached = _cache.get(key)
    if cached and now - cached[0] < settings.weather_cache_minutes * 60:
        raw = cached[1]
    else:
        try:
            raw = _fetch(lat, lon)
        except httpx.HTTPError as exc:
            log.warning("Weather fetch failed: %s", exc)
            raise HTTPException(status_code=502, detail="Weather service unavailable")
        _cache[key] = (now, raw)

    cur = raw["weather"]["current"]
    daily = raw["weather"].get("daily", {})
    air = raw.get("air") or {}
    temp = cur.get("temperature_2m")
    humidity = cur.get("relative_humidity_2m")
    uv = cur.get("uv_index") or 0
    aqi = air.get("us_aqi")
    score, advice = skin_advice(temp, humidity, uv, aqi, condition)
    return {
        "location": {"latitude": lat, "longitude": lon, "timezone": raw["weather"].get("timezone")},
        "temperatureC": temp,
        "feelsLikeC": cur.get("apparent_temperature"),
        "humidity": humidity,
        "uvIndex": uv,
        "uvIndexMaxToday": (daily.get("uv_index_max") or [None])[0],
        "windKph": cur.get("wind_speed_10m"),
        "precipitationMm": cur.get("precipitation"),
        "condition": WEATHER_CODES.get(cur.get("weather_code"), "Unknown"),
        "airQuality": {"usAqi": aqi, "pm2_5": air.get("pm2_5"), "pm10": air.get("pm10")} if air else None,
        "skinRisk": {"score": score, "level": _risk_level(score)},
        "recommendations": advice,
        "observedAt": cur.get("time"),
    }
