import React from 'react';
import { motion } from 'framer-motion';

export interface Milestone {
  id: string;
  number: number;
  label: string;
  targetId: string;
}

export const MILESTONES: Milestone[] = [
  { id: 'starts-small', number: 1, label: 'Early indicators', targetId: 'hero' },
  { id: 'multiplies', number: 2, label: 'Barrier progression', targetId: 'multiplies' },
  { id: 'takes-toll', number: 3, label: 'Systemic factors', targetId: 'takes-toll' },
  { id: 'scan-analyse', number: 4, label: 'Vision scan', targetId: 'scan-analyse' },
  { id: 'review-doctor', number: 5, label: 'Clinical review', targetId: 'review-doctor' },
];

interface TimelineProps {
  activeIndex: number; // 0 to 4
  scrollProgress: number; // 0 to 1
  onMilestoneClick: (index: number, targetId: string) => void;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  activeIndex,
  scrollProgress,
  onMilestoneClick,
  className = '',
}) => {
  return (
    <>
      {/* --- DESKTOP FIXED VERTICAL TIMELINE --- */}
      <div
        className={`hidden lg:flex fixed right-8 xl:right-14 top-1/2 -translate-y-1/2 z-40 flex-col items-start select-none ${className}`}
        style={{ width: '180px' }}
      >
        <div className="relative py-4 pl-3">
          {/* Vertical Connecting Hairline Line */}
          <div className="absolute left-[20px] top-6 bottom-6 w-[1.5px]">
            <div className="absolute inset-0 bg-slate-200" />
            <motion.div
              className="absolute top-0 left-0 w-full bg-[#193653] transition-all duration-150"
              style={{
                height: `${Math.min(Math.max(scrollProgress * 100, 4), 100)}%`,
              }}
            />
          </div>

          {/* Milestone Nodes */}
          <div className="flex flex-col space-y-10 relative z-10">
            {MILESTONES.map((milestone, idx) => {
              const isActive = activeIndex === idx;
              const isPassed = activeIndex >= idx;

              return (
                <button
                  key={milestone.id}
                  onClick={() => onMilestoneClick(idx, milestone.targetId)}
                  className="group flex items-center space-x-3.5 focus:outline-none text-left cursor-pointer transition-colors"
                >
                  {/* Node Circle */}
                  <div
                    className={`relative w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-[#193653] ring-2 ring-slate-300'
                        : isPassed
                        ? 'bg-[#193653]'
                        : 'bg-white border border-slate-300 group-hover:border-[#193653]'
                    }`}
                  >
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Label Text */}
                  <span
                    className={`text-xs transition-colors duration-150 whitespace-nowrap ${
                      isActive
                        ? 'font-medium text-[#193653]'
                        : isPassed
                        ? 'font-normal text-[#193653]/80'
                        : 'font-normal text-[#193653]/50 group-hover:text-[#193653]/80'
                    }`}
                  >
                    {milestone.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- MOBILE COMPACT BOTTOM PROGRESS INDICATOR --- */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center space-x-3 shadow-sm border border-slate-200">
          <span className="text-xs font-medium text-[#193653] whitespace-nowrap">
            Phase {activeIndex + 1} of 5: {MILESTONES[activeIndex]?.label}
          </span>
          <div className="flex items-center space-x-1.5">
            {MILESTONES.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => onMilestoneClick(idx, m.targetId)}
                aria-label={`Go to ${m.label}`}
                className={`h-1.5 rounded-sm transition-all ${
                  activeIndex === idx
                    ? 'w-4 bg-[#193653]'
                    : activeIndex > idx
                    ? 'w-1.5 bg-[#193653]'
                    : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
