import React from 'react';

function Stat({ value, label, badge, badgeClass }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="text-[20px] font-bold text-[#1F2A2E] leading-none">{value}</span>
        {badge && (
          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] text-white font-bold ${badgeClass}`}>{badge}</span>
        )}
      </div>
      <div className="text-[9px] text-[#8A9AA0] mt-0.5 uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

/** Compact summary metrics shown in the dashboard header. */
export function HeaderStats({ scansCount, medsTaken, medsTotal, upcomingAppointments }) {
  const allTaken = medsTotal > 0 && medsTaken === medsTotal;
  return (
    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs text-[#1F2A2E]">
      <Stat value={scansCount} label="Total scans" />
      <div className="w-px h-6 bg-slate-200" />
      <Stat
        value={`${medsTaken}/${medsTotal}`}
        label="Meds taken today"
        badge={medsTotal ? (allTaken ? '✓' : '!') : null}
        badgeClass={allTaken ? 'bg-[#2FBF71]' : 'bg-[#F2C98A]'}
      />
      <div className="w-px h-6 bg-slate-200" />
      <Stat value={upcomingAppointments} label="Appointments" />
    </div>
  );
}
