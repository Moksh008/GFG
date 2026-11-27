import React, { useState } from 'react';
import { CalendarPlus, Search, SlidersHorizontal } from 'lucide-react';

/** Dermatology providers with search and an "available only" filter. */
export function HealthcareProvidersCard({ doctors, onSelectDoctor }) {
  const [query, setQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = doctors.filter(
    (d) =>
      (!availableOnly || d.status === 'Available') &&
      (!q || [d.name, d.department, d.specialty].some((f) => f.toLowerCase().includes(q)))
  );

  return (
    <div className="solid-card h-[340px] flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Healthcare Providers</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">Dermatology specialists & consultations</p>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="h-7 w-32 rounded-full bg-slate-100 flex items-center gap-1.5 px-2.5">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="bg-transparent text-[11px] w-full focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setAvailableOnly((v) => !v)}
            className={`h-7 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer ${
              availableOnly ? 'bg-[#0F3B3F] text-white' : 'bg-slate-100 hover:bg-slate-200 text-[#1F2A2E]'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Available</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 text-[10px] text-[#8A9AA0] px-2 font-semibold uppercase tracking-wider mt-1">
        <div className="col-span-5">Provider</div>
        <div className="col-span-3">Department</div>
        <div className="col-span-2 hidden md:block">Contact</div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      <div className="divide-y divide-slate-100 overflow-y-auto pr-1 flex-1">
        {visible.length === 0 && <p className="text-[11px] text-[#8A9AA0] text-center py-6">No providers match.</p>}
        {visible.map((doc) => {
          const isAvailable = doc.status === 'Available';
          return (
            <div key={doc.id} className="py-2 px-2 hover:bg-slate-50 rounded-lg transition grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5 flex items-center gap-2 min-w-0">
                <img src={doc.avatar} alt={doc.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                <div className="min-w-0 truncate">
                  <div className="text-[12px] font-semibold text-[#1F2A2E] leading-tight truncate">{doc.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-[#2FBF71]' : 'bg-[#E5484D]'}`} />
                    <span className="text-[10px] text-[#8A9AA0]">
                      {isAvailable ? 'Available' : 'Unavailable'} · ★ {doc.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-span-3 truncate">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-slate-700">{doc.department}</span>
              </div>

              <div className="col-span-2 hidden md:block text-[11px] text-[#8A9AA0] truncate font-medium">{doc.contact}</div>

              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectDoctor(doc)}
                  disabled={!isAvailable}
                  className={`h-6 px-2.5 rounded-full text-[10px] font-semibold flex items-center gap-1 transition shadow-xs ${
                    isAvailable ? 'bg-[#0F3B3F] hover:bg-[#1F6A66] text-white cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CalendarPlus className="w-2.5 h-2.5" />
                  <span>Book</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#8A9AA0]">
        <span>Telehealth & in-person dermoscopy</span>
        <span className="text-[#3F5F4A] font-semibold">Board certified</span>
      </div>
    </div>
  );
}
