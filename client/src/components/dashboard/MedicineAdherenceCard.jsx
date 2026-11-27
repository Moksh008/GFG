import React, { useState } from 'react';
import { Pill, Plus } from 'lucide-react';
import { EmptyState } from '../ui/Feedback';
import { percent } from '../../utils/format';

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC = CIRCUMFERENCE * 0.75; // 270° track

function barColor(pct) {
  if (pct === null) return '#E2E8F0';
  if (pct >= 100) return '#3F5F4A';
  if (pct >= 50) return '#F2C98A';
  return '#E5484D';
}

/** 14 daily bars of % doses taken, with a per-bar tooltip. Today is the last bar. */
function DoseHistory({ days }) {
  const [hover, setHover] = useState(null);
  const h = hover !== null ? days[hover] : null;
  return (
    <div className="relative">
      <div className="flex items-center justify-between text-[10px] font-semibold text-[#8A9AA0] mb-1">
        <span>Last {days.length} days</span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#3F5F4A]" />All</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#F2C98A]" />Partial</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#E5484D]" />Missed</span>
        </span>
      </div>
      <div className="flex items-end gap-[3px] h-14" onMouseLeave={() => setHover(null)}>
        {days.map((d, i) => (
          <button
            key={d.date}
            type="button"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onClick={() => setHover(i)}
            aria-label={`${d.date}: ${d.expected ? `${d.taken} of ${d.expected} doses` : 'no medicines scheduled'}`}
            className="flex-1 h-full flex items-end cursor-default"
          >
            <span
              className="w-full rounded-t-[3px] transition-opacity"
              style={{
                height: `${d.pct === null ? 6 : Math.max(d.pct, 6)}%`,
                backgroundColor: barColor(d.pct),
                opacity: hover === null || hover === i ? 1 : 0.45,
                outline: i === days.length - 1 ? '1.5px solid #0F3B3F' : 'none',
                outlineOffset: 1
              }}
            />
          </button>
        ))}
      </div>
      {h && (
        <div className="absolute -top-7 right-0 bg-[#0F2A2E] text-white text-[10px] rounded-md px-2 py-1 pointer-events-none whitespace-nowrap">
          {new Date(`${h.date}T00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}:{' '}
          {h.expected ? `${h.taken}/${h.expected} doses (${Math.round(h.pct)}%)` : 'nothing scheduled'}
        </div>
      )}
    </div>
  );
}

/** Today's doses as a gauge, 14-day history, and the next pending medicine. */
export function MedicineAdherenceCard({ medicines, adherence7d, doseHistory = [], onOpenMeds }) {
  const totalDoses = medicines.reduce((n, m) => n + m.totalDoses, 0);
  const takenDoses = medicines.reduce((n, m) => n + Math.min(m.takenDoses, m.totalDoses), 0);
  const fraction = totalDoses ? takenDoses / totalDoses : 0;
  const pending = medicines.filter((m) => !m.takenToday);
  const next = pending[0];

  return (
    <div className="solid-card min-h-[300px] h-full flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Medicines & Dosage</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">Today's doses & adherence</p>
        </div>
        <button
          type="button"
          onClick={onOpenMeds}
          className="h-7 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center gap-1 text-[11px] font-bold text-[#1F2A2E] transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> {medicines.length ? 'Manage' : 'Add'}
        </button>
      </div>

      {medicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No medicines yet"
          action={
            <button type="button" onClick={onOpenMeds} className="text-[11px] font-bold text-[#0F3B3F] hover:underline cursor-pointer">
              + Add your medicine & dosage
            </button>
          }
        >
          Add creams and tablets with their dosage and schedule to track every dose.
        </EmptyState>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 120 120" className="w-28 h-28 transform rotate-[135deg]" aria-hidden>
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#F1F5F9" strokeWidth="12" strokeDasharray={`${ARC} ${CIRCUMFERENCE}`} strokeLinecap="round" />
                {fraction > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={RADIUS}
                    fill="none"
                    stroke="#3F5F4A"
                    strokeWidth="12"
                    strokeDasharray={`${ARC * fraction} ${CIRCUMFERENCE}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-[#1F2A2E] leading-none">
                  {takenDoses}/{totalDoses}
                </span>
                <span className="text-[9px] text-[#8A9AA0] font-bold uppercase tracking-wider mt-0.5">Doses today</span>
              </div>
            </div>

            <ul className="flex-1 min-w-0 space-y-1">
              {medicines.slice(0, 4).map((m) => (
                <li key={m.id} className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${m.takenToday ? 'bg-[#3F5F4A]' : 'bg-[#F2C98A]'}`} />
                  <span className="truncate font-semibold text-[#1F2A2E]">{m.name}</span>
                  <span className="ml-auto text-[#8A9AA0] shrink-0">{m.takenDoses}/{m.totalDoses}</span>
                </li>
              ))}
              {medicines.length > 4 && <li className="text-[10px] text-[#8A9AA0]">+{medicines.length - 4} more</li>}
              <li className="pt-0.5">
                <span className="text-[10px] font-bold text-[#2F7F55] bg-[#2FBF71]/15 px-2 py-0.5 rounded-full">
                  {percent(adherence7d)} this week
                </span>
              </li>
            </ul>
          </div>

          {doseHistory.length > 0 && <DoseHistory days={doseHistory} />}
        </>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Pill className="w-3 h-3" />
        </div>
        <p className="text-[11px] text-[#8A9AA0] font-medium truncate">
          {next
            ? `Next: ${next.name} · ${next.dosage} · ${next.timing}`
            : medicines.length
              ? 'All doses taken today — nice work.'
              : 'Track your treatment to share adherence with your doctor.'}
        </p>
      </div>
    </div>
  );
}
