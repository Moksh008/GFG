import React from 'react';
import { MoreHorizontal, Pill } from 'lucide-react';
import { EmptyState } from '../ui/Feedback';
import { percent } from '../../utils/format';

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 377
const ARC = CIRCUMFERENCE * 0.75; // 270° track

/** Today's doses as a donut plus 7-day adherence. */
export function MedicineAdherenceCard({ medicines, adherence7d, onOpenMeds }) {
  const totalDoses = medicines.reduce((n, m) => n + m.totalDoses, 0);
  const takenDoses = medicines.reduce((n, m) => n + Math.min(m.takenDoses, m.totalDoses), 0);
  const fraction = totalDoses ? takenDoses / totalDoses : 0;
  const pending = medicines.filter((m) => !m.takenToday);
  const next = pending[0];

  return (
    <div className="solid-card h-[340px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Medicine Adherence</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">Today's doses & weekly compliance</p>
        </div>
        <button
          type="button"
          onClick={onOpenMeds}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#1F2A2E] transition cursor-pointer"
          title="Manage medications"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {medicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No medications yet"
          action={
            <button type="button" onClick={onOpenMeds} className="text-[11px] font-bold text-[#0F3B3F] hover:underline cursor-pointer">
              + Add your first medication
            </button>
          }
        >
          Track creams and tablets to see your adherence.
        </EmptyState>
      ) : (
        <div className="flex items-center justify-between gap-2 py-1">
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 160 160" className="w-36 h-36 transform rotate-[135deg]">
              <defs>
                <linearGradient id="adherenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B98CE8" />
                  <stop offset="50%" stopColor="#F2C98A" />
                  <stop offset="100%" stopColor="#3F5F4A" />
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="#F1F5F9" strokeWidth="16" strokeDasharray={`${ARC} ${CIRCUMFERENCE}`} strokeLinecap="round" />
              {fraction > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r={RADIUS}
                  fill="none"
                  stroke="url(#adherenceGradient)"
                  strokeWidth="16"
                  strokeDasharray={`${ARC * fraction} ${CIRCUMFERENCE}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[22px] font-bold text-[#1F2A2E] leading-none">
                {takenDoses}/{totalDoses}
              </span>
              <span className="text-[9px] text-[#8A9AA0] font-bold uppercase tracking-wider mt-0.5">Doses today</span>
            </div>
          </div>

          <div className="space-y-2.5 pr-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3F5F4A]" />
                <span className="text-sm font-bold text-[#1F2A2E]">{medicines.length - pending.length}</span>
              </div>
              <div className="text-[10px] text-[#8A9AA0] pl-4 font-medium">Completed</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F2C98A]" />
                <span className="text-sm font-bold text-[#1F2A2E]">{pending.length}</span>
              </div>
              <div className="text-[10px] text-[#8A9AA0] pl-4 font-medium">Pending</div>
            </div>
            <div className="pt-0.5">
              <span className="text-[10px] font-bold text-[#2FBF71] bg-[#2FBF71]/15 px-2 py-0.5 rounded-full">
                {percent(adherence7d)} this week
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Pill className="w-3 h-3" />
        </div>
        <p className="text-[11px] text-[#8A9AA0] font-medium truncate">
          {next ? `Next: ${next.name} · ${next.timing}` : medicines.length ? 'All doses taken today — nice work.' : 'Add medications to get reminders.'}
        </p>
      </div>
    </div>
  );
}
