import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Layers } from 'lucide-react';
import { LineChart } from '../ui/LineChart';
import { EmptyState } from '../ui/Feedback';
import { severityColor, shortDate, signed } from '../../utils/format';

const GAUGE_TICKS = 24;

function gaugeTicks(fraction) {
  return Array.from({ length: GAUGE_TICKS }, (_, i) => {
    const rad = ((180 + (i / (GAUGE_TICKS - 1)) * 180) * Math.PI) / 180;
    return {
      x1: 50 + 34 * Math.cos(rad),
      y1: 50 + 34 * Math.sin(rad),
      x2: 50 + 42 * Math.cos(rad),
      y2: 50 + 42 * Math.sin(rad),
      active: i < Math.round(fraction * GAUGE_TICKS)
    };
  });
}

function Delta({ value, unit = '', digits = 0 }) {
  if (value === null || value === undefined) return null;
  const better = value <= 0;
  return (
    <span className={`text-[11px] font-bold ${better ? 'text-[#2FBF71]' : 'text-amber-600'}`}>
      {signed(value, digits)}{unit}
    </span>
  );
}

/** Longitudinal change for the most recently scanned body area. */
export function LesionChangeCard({ scans, comparison, onOpenCompare }) {
  const series = useMemo(() => {
    if (!scans.length) return [];
    const area = scans[0].bodyArea.toLowerCase();
    return scans.filter((s) => s.bodyArea.toLowerCase() === area).slice(0, 7).reverse();
  }, [scans]);

  if (series.length === 0) {
    return (
      <div className="solid-card h-[340px] flex flex-col">
        <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Lesion Change</h3>
        <EmptyState icon={Layers} title="Track a lesion over time">
          Scan the same body area again in a few days to see how size and redness change.
        </EmptyState>
      </div>
    );
  }

  const first = series[0];
  const latest = series[series.length - 1];
  const improvement = comparison?.improvement;
  const improvementPct = improvement?.improvementPct ?? null;
  const maxArea = Math.max(...series.map((s) => s.areaCm2), 0.1);
  const recent = series.slice(-3);

  return (
    <div className="solid-card h-[340px] flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Lesion Change</h3>
            <p className="text-[11px] text-[#8A9AA0] font-medium truncate">{latest.bodyArea} · severity over time</p>
          </div>
          {improvementPct !== null && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0 ${
                improvementPct >= 0 ? 'bg-[#2FBF71]/15 text-[#2FBF71]' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {improvementPct >= 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
              <span className="text-xs font-bold">{Math.abs(improvementPct).toFixed(0)}%</span>
              <span className="text-[10px] font-semibold">{improvementPct >= 0 ? 'Better' : 'Worse'}</span>
            </div>
          )}
        </div>

        <div className="mt-2">
          <LineChart
            ghost
            height={80}
            points={series.map((s) => ({ label: shortDate(s.createdAt), value: s.severityScore, color: severityColor(s.severityScore) }))}
            formatValue={(v) => `${v}/100`}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 py-1 px-1">
        <div className="w-5 h-5 rounded-full bg-[#3F5F4A]/15 flex items-center justify-center shrink-0">
          <span className="text-[9px] font-bold text-[#3F5F4A]">AI</span>
        </div>
        <p className="text-[11px] text-[#1F2A2E] truncate font-semibold" title={improvement?.analysis}>
          {improvement?.analysis || 'Scan this area again to unlock AI progress analysis.'}
        </p>
        <button
          type="button"
          onClick={onOpenCompare}
          disabled={!comparison}
          className="ml-auto text-[11px] font-bold text-[#0F3B3F] hover:underline shrink-0 cursor-pointer disabled:opacity-40 disabled:no-underline"
        >
          Compare
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
        <div className="flex flex-col justify-between py-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8A9AA0]">Redness</span>
            <Delta value={series.length > 1 ? latest.rednessIndex - first.rednessIndex : null} unit="%" />
          </div>
          <div className="flex items-end justify-around px-2 h-12 pt-1">
            {recent.map((s) => (
              <div key={s.id} className="flex flex-col items-center justify-end h-full">
                <div
                  className="w-5 rounded-t-sm"
                  style={{ height: `${Math.max(s.rednessIndex, 4) * 0.36}px`, backgroundColor: severityColor(s.severityScore) }}
                  title={`${s.rednessIndex}%`}
                />
                <span className="text-[9px] text-[#8A9AA0] mt-1 font-semibold">{shortDate(s.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between py-1 pl-2 border-l border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8A9AA0]">Est. area (cm²)</span>
            <Delta value={series.length > 1 ? latest.areaCm2 - first.areaCm2 : null} digits={1} />
          </div>
          <div className="relative flex items-center justify-center h-12">
            <svg viewBox="0 0 100 60" className="w-24 h-12">
              {gaugeTicks(latest.areaCm2 / maxArea).map((t, i) => (
                <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.active ? '#3F5F4A' : '#E2E8F0'} strokeWidth="1.8" strokeLinecap="round" />
              ))}
            </svg>
            <div className="absolute top-4 text-center leading-tight">
              <div className="text-xs font-bold text-[#1F2A2E]">{latest.areaCm2}</div>
              <div className="text-[8px] text-[#8A9AA0] font-semibold">cm²</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
