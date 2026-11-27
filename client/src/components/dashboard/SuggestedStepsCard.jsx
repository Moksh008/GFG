import React from 'react';
import { Apple, Camera, Check, ClipboardList, Dumbbell, FlaskConical, Stethoscope } from 'lucide-react';
import { EmptyState } from '../ui/Feedback';

const CATEGORY_ICONS = {
  Assessment: Camera,
  Testing: FlaskConical,
  Specialists: Stethoscope,
  Nutrition: Apple,
  Exercise: Dumbbell
};

/** Care-plan steps; click the icon to mark a step done. Open steps are listed first. */
export function SuggestedStepsCard({ careSteps, onOpenPlanModal, onToggleStep }) {
  const ordered = [...careSteps].sort((a, b) => Number(a.completed) - Number(b.completed));

  return (
    <div className="solid-card min-h-[300px] lg:h-[340px] flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Suggested Next Steps</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">Your personalised care plan</p>
        </div>
        <button
          type="button"
          onClick={onOpenPlanModal}
          className="h-7 px-3 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1F2A2E] flex items-center gap-1 transition cursor-pointer"
        >
          Create Plan +
        </button>
      </div>

      {ordered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No care steps yet">
          Create a plan to track treatments, tests and lifestyle changes.
        </EmptyState>
      ) : (
        <div className="divide-y divide-slate-100 overflow-y-auto pr-1 flex-1 mt-1">
          {ordered.map((step) => {
            const Icon = CATEGORY_ICONS[step.category] || Camera;
            return (
              <div
                key={step.id}
                className={`py-1.5 px-1 hover:bg-slate-50 rounded-lg transition flex items-center justify-between gap-2 ${
                  step.completed ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleStep(step)}
                    title={step.completed ? 'Mark as not done' : 'Mark as done'}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition cursor-pointer ${
                      step.completed ? 'bg-[#2FBF71] text-white' : 'bg-[#DCEBE8] text-[#3F5F4A] hover:bg-[#c9e0db]'
                    }`}
                  >
                    {step.completed ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </button>
                  <div className="min-w-0 truncate">
                    <div className={`text-[12px] font-semibold text-[#1F2A2E] leading-tight truncate ${step.completed ? 'line-through' : ''}`}>
                      {step.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {step.dateRange && (
                        <span className="text-[10px] text-[#8A9AA0] bg-slate-100 px-1.5 rounded-md font-medium">{step.dateRange}</span>
                      )}
                      <span className="text-[10px] font-semibold text-[#3F5F4A]">{step.completed ? 'Done' : step.status}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 max-w-[130px] hidden sm:block">
                  {step.bullets.slice(0, 2).map((b) => (
                    <div key={b} className="text-[10px] text-[#8A9AA0] truncate font-medium">• {b}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
