import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export function MedicineAdherenceCard({ medicines, onOpenMeds }) {
  const takenCount = medicines.filter((m) => m.takenToday).length;
  const totalCount = medicines.length;
  const adherencePct = Math.round((takenCount / totalCount) * 100);

  return (
    <div className="solid-card h-[340px] flex flex-col justify-between">
      {/* Top Title & "..." button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Medicine Adherence</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">Dosing compliance & adherence</p>
        </div>
        <button
          onClick={onOpenMeds}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#1F2A2E] transition cursor-pointer"
          title="Manage Prescriptions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Donut Chart and Labels */}
      <div className="flex items-center justify-between gap-2 py-1">
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 160 160" className="w-36 h-36 transform -rotate-45">
            <defs>
              <linearGradient id="dermaDonutGradSolid" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B98CE8" />
                <stop offset="50%" stopColor="#F2C98A" />
                <stop offset="100%" stopColor="#3F5F4A" />
              </linearGradient>
            </defs>

            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="16"
              strokeDasharray="282 377"
              strokeLinecap="round"
            />

            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="url(#dermaDonutGradSolid)"
              strokeWidth="16"
              strokeDasharray="230 377"
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[22px] font-bold text-[#1F2A2E] leading-none">860</span>
            <span className="text-[9px] text-[#8A9AA0] font-bold uppercase tracking-wider mt-0.5">Capacity</span>
          </div>
        </div>

        {/* Labels on the right */}
        <div className="space-y-2.5 pr-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3F5F4A]"></span>
              <span className="text-sm font-bold text-[#1F2A2E]">650</span>
            </div>
            <div className="text-[10px] text-[#8A9AA0] pl-4 font-medium">Completed Doses</div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2C98A]"></span>
              <span className="text-sm font-bold text-[#1F2A2E]">326</span>
            </div>
            <div className="text-[10px] text-[#8A9AA0] pl-4 font-medium">Upcoming Refills</div>
          </div>

          <div className="pt-0.5">
            <span className="text-[10px] font-bold text-[#2FBF71] bg-[#2FBF71]/15 px-2 py-0.5 rounded-full">
              {adherencePct}% Today
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
          alt="Dermatology nurse note"
          className="w-6 h-6 rounded-full object-cover border border-slate-200"
        />
        <p className="text-[11px] text-[#8A9AA0] font-medium truncate">
          Evening dose due in 2 hrs: Desonide cream.
        </p>
      </div>
    </div>
  );
}
