import React, { useState } from 'react';
import { initialScans } from '../data/mockData';

export function SkinHealthTrendCard({ scans = initialScans, onOpenScanModal }) {
  const [activeTab, setActiveTab] = useState('Daily');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const bars = [
    { id: 1, day: 'Mon', h: 35, color: '#E2E8F0', note: 'Routine' },
    { id: 2, day: 'Mon', h: 42, color: '#E2E8F0', note: 'Routine' },
    { id: 3, day: 'Tue', h: 28, color: '#E2E8F0', note: 'Stable' },
    { id: 4, day: 'Tue', h: 48, color: '#E2E8F0', note: 'Stable' },
    { id: 5, day: 'Wed', h: 80, color: '#F2C98A', isSpecial: true, tag: 'Scan Flare', score: '62%' },
    { id: 6, day: 'Wed', h: 50, color: '#E2E8F0', note: 'Steroid Applied' },
    { id: 7, day: 'Thu', h: 88, color: '#B98CE8', isSpecial: true, tag: 'Peak Reaction', score: '74%' },
    { id: 8, day: 'Thu', h: 45, color: '#E2E8F0', note: 'Cooling Compress' },
    { id: 9, day: 'Fri', h: 72, color: '#3F5F4A', isSpecial: true, tag: 'Epithelial Healing', score: '64%' },
    { id: 10, day: 'Fri', h: 38, color: '#E2E8F0', note: 'Regenerating' },
    { id: 11, day: 'Sat', h: 32, color: '#E2E8F0', note: 'Clear' },
    { id: 12, day: 'Sat', h: 26, color: '#E2E8F0', note: 'Clear' },
    { id: 13, day: 'Sun', h: 22, color: '#E2E8F0', note: 'Clear' },
    { id: 14, day: 'Sun', h: 20, color: '#E2E8F0', note: 'Resolved' },
  ];

  return (
    <div className="solid-card h-[340px] flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Skin Health Trend</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#3F5F4A]/10 text-[#3F5F4A]">
                Epithelial Recovery
              </span>
            </div>
            <p className="text-[11px] text-[#8A9AA0] mt-0.5 font-medium">Biometric scan severity score over active cycle</p>
          </div>

          <div className="text-right">
            <div className="text-[26px] font-bold text-[#1F2A2E] leading-none">64%</div>
            <div className="text-[11px] font-semibold text-[#2FBF71] mt-0.5">Optimal Clearing</div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex items-center gap-4 mt-2.5 pb-1 border-b border-slate-100">
          {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-xs pb-1 relative transition-colors cursor-pointer ${
                activeTab === tab ? 'text-[#1F2A2E] font-bold' : 'text-[#8A9AA0] font-medium hover:text-[#1F2A2E]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F2A2E] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lollipop Chart Area */}
      <div className="relative pt-4 pb-1">
        <div className="h-40 flex items-end justify-between px-3 relative">
          {bars.map((bar) => {
            return (
              <div key={bar.id} className="flex flex-col items-center group relative h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 bg-slate-900 text-white text-[10px] rounded-md px-2 py-1 pointer-events-none whitespace-nowrap z-20 shadow-md">
                  {bar.isSpecial ? `${bar.tag} (${bar.score})` : `${bar.note}: ${bar.h}%`}
                </div>

                <div
                  className="w-2 h-2 rounded-full transition-transform group-hover:scale-150 duration-200"
                  style={{
                    backgroundColor: bar.color,
                    boxShadow: bar.isSpecial ? `0 0 6px ${bar.color}` : 'none'
                  }}
                />

                <div
                  className="w-0.5 rounded-full transition-all duration-300"
                  style={{
                    height: `${bar.h}%`,
                    backgroundColor: bar.color
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between px-3.5 mt-2 text-[10px] font-semibold text-[#8A9AA0]">
          {days.map((day) => (
            <span key={day} className="w-8 text-center">{day}</span>
          ))}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#8A9AA0] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#F2C98A]"></span> Amber: Flare
          </span>
          <span className="flex items-center gap-1.5 text-[#8A9AA0] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#B98CE8]"></span> Purple: Reaction
          </span>
          <span className="flex items-center gap-1.5 text-[#8A9AA0] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#3F5F4A]"></span> Green: Clearance
          </span>
        </div>
        <button
          onClick={onOpenScanModal}
          className="text-[#3F5F4A] hover:text-[#1F6A66] font-bold underline underline-offset-2 transition cursor-pointer"
        >
          + Log New Scan
        </button>
      </div>
    </div>
  );
}
