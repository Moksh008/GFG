import React from 'react';
import { Camera, FlaskConical, Stethoscope, Apple, Dumbbell } from 'lucide-react';

const iconMap = {
  Assessment: Camera,
  Testing: FlaskConical,
  Specialists: Stethoscope,
  Nutrition: Apple,
  Exercise: Dumbbell
};

export function SuggestedStepsCard({ careSteps, onOpenPlanModal }) {
  return (
    <div className="solid-card h-[340px] flex flex-col justify-between">
      {/* Title left, "Create Plan +" pill button right */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Suggested Next Steps</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">Personalized clinical care protocol</p>
        </div>
        <button
          onClick={onOpenPlanModal}
          className="h-7 px-3 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1F2A2E] flex items-center gap-1 transition cursor-pointer"
        >
          Create Plan +
        </button>
      </div>

      {/* 5 rows */}
      <div className="divide-y divide-slate-100 overflow-y-auto pr-1">
        {careSteps.map((step) => {
          const Icon = iconMap[step.category] || Camera;
          return (
            <div
              key={step.id}
              className="py-1.5 px-1 hover:bg-slate-50 rounded-lg transition flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#DCEBE8] text-[#3F5F4A] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-[12px] font-semibold text-[#1F2A2E] leading-tight truncate">
                    {step.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-[#8A9AA0] bg-slate-100 px-1.5 py-0.2 rounded-md font-medium">
                      {step.dateRange}
                    </span>
                    <span className="text-[10px] font-semibold text-[#3F5F4A]">
                      {step.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 max-w-[130px] hidden sm:block">
                <div className="text-[10px] text-[#8A9AA0] truncate font-medium">
                  • {step.bullets[0]}
                </div>
                {step.bullets[1] && (
                  <div className="text-[10px] text-[#8A9AA0] truncate font-medium">
                    • {step.bullets[1]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
