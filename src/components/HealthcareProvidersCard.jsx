import React from 'react';
import { Search, SlidersHorizontal, CalendarPlus } from 'lucide-react';

export function HealthcareProvidersCard({ doctors, onSelectDoctor }) {
  return (
    <div className="solid-card h-[340px] flex flex-col justify-between">
      {/* Header: Title left. Right: search + filter */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Healthcare Providers</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">Dermatology specialists & clinical consultation</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#1F2A2E] transition cursor-pointer"
            title="Search Doctors"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            type="button"
            className="h-7 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 text-xs font-semibold text-[#1F2A2E] transition cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-500" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 text-[10px] text-[#8A9AA0] px-2 font-semibold uppercase tracking-wider">
        <div className="col-span-5">Provider Name</div>
        <div className="col-span-3">Department</div>
        <div className="col-span-2 hidden md:block">Contact</div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      {/* 3 rows */}
      <div className="divide-y divide-slate-100 overflow-y-auto pr-1">
        {doctors.map((doc) => {
          const isAvailable = doc.status === 'Available';
          return (
            <div
              key={doc.id}
              className="py-2 px-2 hover:bg-slate-50 rounded-lg transition grid grid-cols-12 gap-2 items-center"
            >
              <div className="col-span-5 flex items-center gap-2 min-w-0">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 truncate">
                  <div className="text-[12px] font-semibold text-[#1F2A2E] leading-tight truncate">
                    {doc.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isAvailable ? 'bg-[#2FBF71]' : 'bg-[#E5484D]'
                      }`}
                    />
                    <span className="text-[10px] text-[#8A9AA0]">
                      {isAvailable ? 'Available' : 'Absent'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-span-3 text-xs text-[#1F2A2E] truncate">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-slate-700">
                  {doc.department}
                </span>
              </div>

              <div className="col-span-2 hidden md:block text-[11px] text-[#8A9AA0] truncate font-medium">
                {doc.contact}
              </div>

              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectDoctor(doc)}
                  className={`h-6 px-2.5 rounded-full text-[10px] font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer ${
                    isAvailable
                      ? 'bg-[#0F3B3F] hover:bg-[#1F6A66] text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                >
                  <CalendarPlus className="w-2.5 h-2.5" />
                  <span>Book</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical Notice */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#8A9AA0]">
        <span>Telehealth & In-person Dermoscopy</span>
        <span className="text-[#3F5F4A] font-semibold">Board Certified</span>
      </div>
    </div>
  );
}
