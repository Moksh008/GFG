import React from 'react';
import { CloudSun, Droplets, MapPin, Sun, Wind } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';
import { EmptyState, Spinner } from '../ui/Feedback';

const RISK_STYLE = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200'
};

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
      <Icon className="w-3.5 h-3.5 mx-auto text-[#3F5F4A]" />
      <div className="text-sm font-bold text-[#1F2A2E] mt-0.5">{value ?? '—'}</div>
      <div className="text-[9px] text-[#8A9AA0] uppercase font-semibold tracking-wider">{label}</div>
    </div>
  );
}

/** Weather, UV and air quality with skin-specific advice. */
export function EnvironmentCard() {
  const { status, data, error, locate } = useWeather();

  return (
    <div className="solid-card min-h-[280px] lg:h-[300px] flex flex-col">
      <div className="flex items-start justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Environment</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">{data ? data.condition : 'Weather triggers for your skin'}</p>
        </div>
        {data && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${RISK_STYLE[data.skinRisk.level]}`}>
            {data.skinRisk.level} skin risk
          </span>
        )}
      </div>

      {status === 'loading' && <Spinner label="Checking local conditions…" />}

      {status === 'needs-location' && (
        <EmptyState
          icon={MapPin}
          title="Share your location"
          action={
            <button type="button" onClick={locate} className="text-[11px] font-bold text-[#0F3B3F] hover:underline cursor-pointer">
              Use my location
            </button>
          }
        >
          Humidity, UV and pollution all affect flares. Allow location to see today's conditions.
        </EmptyState>
      )}

      {status === 'error' && (
        <EmptyState icon={CloudSun} title="Weather unavailable">
          {error?.message}
        </EmptyState>
      )}

      {status === 'ready' && data && (
        <div className="flex-1 flex flex-col justify-between pt-2 gap-2">
          <div className="grid grid-cols-4 gap-1.5">
            <Metric icon={Sun} label="Temp" value={data.temperatureC != null ? `${Math.round(data.temperatureC)}°` : null} />
            <Metric icon={Droplets} label="Humidity" value={data.humidity != null ? `${data.humidity}%` : null} />
            <Metric icon={Sun} label="UV" value={data.uvIndex != null ? data.uvIndex.toFixed(1) : null} />
            <Metric icon={Wind} label="AQI" value={data.airQuality?.usAqi ?? null} />
          </div>
          <ul className="space-y-1 overflow-y-auto">
            {data.recommendations.slice(0, 3).map((r) => (
              <li key={r} className="text-[11px] text-[#1F2A2E] leading-snug flex gap-1.5">
                <span className="text-[#3F5F4A]">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
