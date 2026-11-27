import React, { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowLeftRight, ArrowUpRight, Camera, Clock, Layers, Minus } from 'lucide-react';
import { EmptyState } from '../ui/Feedback';
import { TrendChart } from '../ui/TrendChart';
import { dateTime, relativeDays, severityColor, shortDate, signed } from '../../utils/format';

// lowerIsBetter decides whether a rise is shown as an improvement or a deterioration.
const METRICS = [
  { key: 'areaCm2', delta: 'areaCm2', label: 'Affected area', short: 'Area', unit: ' cm²', digits: 1, lowerIsBetter: true },
  { key: 'severityScore', delta: 'severity', label: 'Severity', short: 'Severity', unit: '/100', digits: 0, lowerIsBetter: true, max: 100 },
  { key: 'rednessIndex', delta: 'redness', label: 'Redness', short: 'Redness', unit: '%', digits: 0, lowerIsBetter: true, max: 100 },
  { key: 'borderRegularityScore', delta: 'border', label: 'Border regularity', unit: '%', digits: 0, lowerIsBetter: false, max: 100 },
  { key: 'symmetryScore', delta: 'symmetry', label: 'Symmetry', unit: '%', digits: 0, lowerIsBetter: false, max: 100 }
];
const CHART_METRICS = METRICS.slice(0, 3);

function fmt(v, digits) {
  return Number(v).toFixed(digits);
}

function Change({ value, metric, compact }) {
  if (value === null || value === undefined) return <span className="text-[10px] text-[#8A9AA0] font-medium">—</span>;
  const flat = Math.abs(value) < (metric.digits ? 0.05 : 1);
  const better = metric.lowerIsBetter ? value < 0 : value > 0;
  const Icon = flat ? Minus : value < 0 ? ArrowDownRight : ArrowUpRight;
  const tone = flat ? 'text-slate-500' : better ? 'text-emerald-600' : 'text-amber-600';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold whitespace-nowrap ${tone}`}>
      <Icon className="w-3 h-3" />
      {signed(value, metric.digits)}
      {metric.unit === '/100' ? '' : metric.unit}
      {!compact && !flat && <span className="font-semibold">{better ? ' better' : ' worse'}</span>}
    </span>
  );
}

function MetricTile({ metric, area }) {
  const v = area.latest[metric.key];
  return (
    <div className="rounded-xl border border-slate-100 bg-[#FAFBFB] p-2.5 min-w-0">
      <div className="text-[10px] text-[#8A9AA0] font-semibold uppercase tracking-wider truncate">{metric.label}</div>
      <div className="text-lg font-bold text-[#1F2A2E] leading-tight mt-0.5">
        {fmt(v, metric.digits)}
        <span className="text-[11px] font-semibold text-[#8A9AA0]">{metric.unit}</span>
      </div>
      <div className="mt-1 space-y-0.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] text-[#8A9AA0] font-semibold whitespace-nowrap">vs last</span>
          <Change value={area.vsPrevious?.[metric.delta]} metric={metric} compact />
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] text-[#8A9AA0] font-semibold whitespace-nowrap">vs first</span>
          <Change value={area.vsBaseline?.[metric.delta]} metric={metric} compact />
        </div>
      </div>
    </div>
  );
}

/** Per-body-area tracking: every scan's time and measurements, and how they changed. */
export function AreaTrackerCard({ areas, onScan, onOpenScan, onCompare }) {
  const [selected, setSelected] = useState(null);
  const [chartKey, setChartKey] = useState('areaCm2');
  const area = areas.find((a) => a.key === selected) || areas[0];
  const metric = CHART_METRICS.find((m) => m.key === chartKey);

  const points = useMemo(
    () =>
      (area?.scans || []).map((s) => ({
        label: shortDate(s.createdAt),
        value: s[chartKey],
        color: severityColor(s.severityScore),
        detailTitle: dateTime(s.createdAt),
        detail: `${s.status} · severity ${s.severityScore}`
      })),
    [area, chartKey]
  );

  if (!area) {
    return (
      <div className="solid-card min-h-[300px] flex flex-col">
        <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Affected Area Tracker</h3>
        <EmptyState
          icon={Layers}
          title="No areas tracked yet"
          action={
            <button type="button" onClick={() => onScan()} className="text-[11px] font-bold text-[#0F3B3F] hover:underline cursor-pointer">
              + Scan an area
            </button>
          }
        >
          Each body area you scan gets its own timeline — size, redness and borders, compared scan by scan.
        </EmptyState>
      </div>
    );
  }

  const timeline = [...area.scans].reverse(); // newest first

  return (
    <div className="solid-card flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Affected Area Tracker</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">
            {area.scans.length} scan{area.scans.length === 1 ? '' : 's'} of {area.name} · first {shortDate(area.scans[0].createdAt)} · latest{' '}
            {relativeDays(area.latest.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onCompare(area.baseline, area.latest)}
            disabled={!area.baseline}
            className="h-8 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-[#1F2A2E] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={area.baseline ? 'Compare first and latest photos' : 'Scan this area again to compare'}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> First vs latest
          </button>
          <button
            type="button"
            onClick={() => onScan(area.name)}
            className="h-8 px-3 rounded-full bg-[#0F3B3F] hover:bg-[#1F6A66] text-white text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" /> Re-scan
          </button>
        </div>
      </div>

      {areas.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1" role="tablist" aria-label="Body areas">
          {areas.map((a) => {
            const active = a.key === area.key;
            return (
              <button
                key={a.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(a.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                  active ? 'bg-[#0F3B3F] text-white border-[#0F3B3F]' : 'bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor(a.latest.severityScore) }} />
                {a.name}
                <span className={`text-[10px] ${active ? 'opacity-75' : 'text-[#8A9AA0]'}`}>{a.scans.length}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {METRICS.map((m) => (
          <MetricTile key={m.key} metric={m} area={area} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-7 min-w-0">
          <div className="rounded-xl border border-slate-100 p-3 h-full">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-semibold text-[#1F2A2E]">{metric.label} over time</span>
              <div className="flex bg-slate-100 rounded-full p-0.5">
                {CHART_METRICS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setChartKey(m.key)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      chartKey === m.key ? 'bg-white text-[#0F3B3F] shadow-xs' : 'text-[#8A9AA0] hover:text-[#1F2A2E]'
                    }`}
                  >
                    {m.short}
                  </button>
                ))}
              </div>
            </div>
            {points.length < 2 ? (
              <p className="text-[11px] text-[#8A9AA0] py-8 text-center">
                One scan so far — re-scan {area.name} to start the trend line.
              </p>
            ) : (
              <TrendChart
                points={points}
                height={150}
                max={metric.max}
                formatValue={(v) => `${fmt(v, metric.digits)}${metric.unit}`}
                ariaLabel={`${metric.label} of ${area.name} over time`}
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-5 min-w-0">
          <div className="text-[11px] font-semibold text-[#1F2A2E] mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#3F5F4A]" /> Scan timeline
          </div>
          <ol className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
            {timeline.map((s, i) => {
              const prev = timeline[i + 1];
              const areaDelta = prev ? s.areaCm2 - prev.areaCm2 : null;
              return (
                <li key={s.id}>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                    <button type="button" onClick={() => onOpenScan(s)} className="shrink-0 cursor-pointer" aria-label={`Open scan from ${dateTime(s.createdAt)}`}>
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt="" className="w-11 h-11 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-slate-100" />
                      )}
                    </button>
                    <button type="button" onClick={() => onOpenScan(s)} className="flex-1 min-w-0 text-left cursor-pointer">
                      <div className="text-[11px] font-bold text-[#1F2A2E] flex items-center gap-1.5">
                        {dateTime(s.createdAt)}
                        {i === 0 && <span className="text-[9px] px-1.5 rounded-full bg-[#0F3B3F] text-white">Latest</span>}
                        {i === timeline.length - 1 && timeline.length > 1 && (
                          <span className="text-[9px] px-1.5 rounded-full bg-slate-200 text-slate-700">Baseline</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8A9AA0] font-medium truncate">
                        {s.areaCm2} cm² · severity {s.severityScore} · redness {s.rednessIndex}%
                      </div>
                    </button>
                    <div className="text-right shrink-0">
                      {areaDelta !== null ? (
                        <Change value={+areaDelta.toFixed(2)} metric={METRICS[0]} compact />
                      ) : (
                        <span className="text-[10px] text-[#8A9AA0] font-semibold">First</span>
                      )}
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => onCompare(s, area.latest)}
                          className="block ml-auto text-[10px] font-bold text-[#0F3B3F] hover:underline cursor-pointer"
                        >
                          vs latest
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
