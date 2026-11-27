import React, { useMemo, useState } from 'react';
import { Camera } from 'lucide-react';
import { EmptyState } from '../ui/Feedback';
import { severityColor, shortDate } from '../../utils/format';

const RANGES = { Week: 7, Month: 30, Quarter: 90, All: Infinity };
const MAX_BARS = 14;

const LEGEND = [
  { color: '#3F5F4A', label: 'Clearing (<40)' },
  { color: '#F2C98A', label: 'Flare (40-64)' },
  { color: '#B98CE8', label: 'Reaction (65+)' }
];

/** Lollipop chart of scan severity over time (lower is better). */
export function SkinHealthTrendCard({ scans, onOpenScanModal }) {
  const [range, setRange] = useState('Month');

  const bars = useMemo(() => {
    if (!scans.length) return [];
    // Window is measured back from the most recent scan.
    const cutoff = new Date(scans[0].createdAt).getTime() - RANGES[range] * 86400000;
    return scans
      .filter((s) => new Date(s.createdAt).getTime() >= cutoff)
      .slice(0, MAX_BARS)
      .reverse(); // chronological, oldest -> newest
  }, [scans, range]);

  const latest = scans[0];
  const health = latest ? 100 - latest.severityScore : null;

  return (
    <div className="solid-card h-[340px] flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Skin Health Trend</h3>
              {latest && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#3F5F4A]/10 text-[#3F5F4A] capitalize">
                  {latest.condition === 'normal' ? 'Clear skin' : latest.condition}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8A9AA0] mt-0.5 font-medium">AI severity score per scan (lower is better)</p>
          </div>

          {latest && (
            <div className="text-right">
              <div className="text-[26px] font-bold text-[#1F2A2E] leading-none">{health}%</div>
              <div className="text-[11px] font-semibold mt-0.5" style={{ color: severityColor(latest.severityScore) }}>
                {latest.status}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-2.5 pb-1 border-b border-slate-100">
          {Object.keys(RANGES).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRange(tab)}
              className={`text-xs pb-1 relative transition-colors cursor-pointer ${
                range === tab ? 'text-[#1F2A2E] font-bold' : 'text-[#8A9AA0] font-medium hover:text-[#1F2A2E]'
              }`}
            >
              {tab}
              {range === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F2A2E] rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {bars.length === 0 ? (
        <EmptyState icon={Camera} title={scans.length ? 'No scans in this period' : 'No scans yet'}>
          {scans.length ? 'Try a longer range.' : 'Take your first skin photo to start tracking.'}
        </EmptyState>
      ) : (
        <div className="relative pt-4 pb-1">
          <div className="h-40 flex items-end justify-around px-3">
            {bars.map((scan) => {
              const color = severityColor(scan.severityScore);
              return (
                <div key={scan.id} className="flex flex-col items-center group relative h-full justify-end w-6">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 bg-slate-900 text-white text-[10px] rounded-md px-2 py-1 pointer-events-none whitespace-nowrap z-20 shadow-md">
                    {scan.bodyArea}: {scan.severityScore}/100
                  </div>
                  <div
                    className="w-2 h-2 rounded-full transition-transform group-hover:scale-150 duration-200"
                    style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                  />
                  <div className="w-0.5 rounded-full" style={{ height: `${Math.max(scan.severityScore, 3)}%`, backgroundColor: color }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-around px-3 mt-2 text-[10px] font-semibold text-[#8A9AA0]">
            {bars.map((scan) => (
              <span key={scan.id} className="w-6 text-center whitespace-nowrap">{shortDate(scan.createdAt)}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] gap-2">
        <div className="flex items-center gap-3 overflow-hidden">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[#8A9AA0] font-medium whitespace-nowrap">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} /> {l.label}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onOpenScanModal}
          className="text-[#3F5F4A] hover:text-[#1F6A66] font-bold underline underline-offset-2 transition cursor-pointer shrink-0"
        >
          + New Scan
        </button>
      </div>
    </div>
  );
}
