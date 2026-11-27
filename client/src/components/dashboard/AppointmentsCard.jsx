import React, { useMemo, useState } from 'react';
import { CalendarCheck, CalendarPlus, FileText, MapPin, Search, Sparkles, Star, Video, X } from 'lucide-react';
import { EmptyState } from '../ui/Feedback';
import { formatSlot, initials, parseSlot } from '../../utils/format';

export function DoctorAvatar({ doctor, size = 'w-9 h-9' }) {
  return doctor.avatar ? (
    <img src={doctor.avatar} alt="" className={`${size} rounded-full object-cover border border-slate-200 shrink-0`} />
  ) : (
    <div className={`${size} rounded-full bg-[#DCEBE8] text-[#0F3B3F] text-[11px] font-bold flex items-center justify-center shrink-0 border border-slate-200`}>
      {initials(doctor.name.replace(/^Dr\.?\s*/, '').replace(/,.*$/, ''))}
    </div>
  );
}

function DateBadge({ slot }) {
  const d = parseSlot(slot);
  return (
    <div className="w-11 shrink-0 rounded-xl bg-[#0F3B3F] text-white text-center py-1">
      <div className="text-[9px] font-bold uppercase opacity-80">{d ? d.toLocaleDateString(undefined, { month: 'short' }) : '—'}</div>
      <div className="text-base font-bold leading-none">{d ? d.getDate() : '?'}</div>
    </div>
  );
}

function VisitRow({ apt, onCancel, past }) {
  const video = /video/i.test(apt.type);
  return (
    <div className={`flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 ${past ? 'opacity-60' : ''}`}>
      <DateBadge slot={apt.date} />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-[#1F2A2E] truncate">{apt.doctor}</div>
        <div className="text-[10px] text-[#8A9AA0] font-medium flex items-center gap-1 truncate">
          {video ? <Video className="w-3 h-3 shrink-0" /> : <MapPin className="w-3 h-3 shrink-0" />}
          {formatSlot(apt.date)} · {apt.department}
        </div>
        {apt.notes && <div className="text-[10px] text-[#647C7C] truncate">“{apt.notes}”</div>}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {apt.reportAttached && (
          <span className="text-[9px] font-bold text-[#3F5F4A] bg-[#DCEBE8] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <FileText className="w-2.5 h-2.5" /> Report
          </span>
        )}
        {!past && (
          <button
            type="button"
            onClick={() => onCancel(apt)}
            className="text-[10px] font-semibold text-slate-500 hover:text-red-600 flex items-center gap-0.5 cursor-pointer"
          >
            <X className="w-3 h-3" /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/** Upcoming visits + a specialist finder filtered by department. */
export function AppointmentsCard({ doctors, appointments, recommendation, onBook, onCancel }) {
  const confirmed = appointments.filter((a) => a.status === 'confirmed');
  const upcoming = confirmed.filter((a) => a.upcoming);
  const past = confirmed.filter((a) => !a.upcoming).reverse();
  const [tab, setTab] = useState(null); // null = auto
  const activeTab = tab || (upcoming.length ? 'upcoming' : 'find');
  const [dept, setDept] = useState(null); // null = auto (recommended)
  const [query, setQuery] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(null);

  const departments = useMemo(() => [...new Set(doctors.map((d) => d.department))].sort(), [doctors]);
  const activeDept = dept ?? (recommendation && departments.includes(recommendation.department) ? recommendation.department : 'All');
  const q = query.trim().toLowerCase();
  const visible = doctors
    .filter((d) => activeDept === 'All' || d.department === activeDept)
    .filter((d) => !q || [d.name, d.specialty, d.department].some((f) => f.toLowerCase().includes(q)))
    .sort((a, b) => Number(b.status === 'Available') - Number(a.status === 'Available') || b.rating - a.rating);

  return (
    <div className="solid-card min-h-[300px] lg:h-[360px] flex flex-col">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Appointments</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">Book dermatology specialists · in person or video</p>
        </div>
        <div className="flex bg-slate-100 rounded-full p-0.5 shrink-0">
          {[
            ['upcoming', `Upcoming${upcoming.length ? ` (${upcoming.length})` : ''}`],
            ['find', 'Find specialist']
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                activeTab === key ? 'bg-white text-[#0F3B3F] shadow-xs' : 'text-[#8A9AA0] hover:text-[#1F2A2E]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'upcoming' ? (
        <div className="flex-1 overflow-y-auto pr-1 mt-2 space-y-1.5">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No upcoming visits"
              action={
                <button type="button" onClick={() => setTab('find')} className="text-[11px] font-bold text-[#0F3B3F] hover:underline cursor-pointer">
                  Find a specialist →
                </button>
              }
            >
              Book a dermatologist and share your Dermora report with one tap.
            </EmptyState>
          ) : (
            upcoming.map((a) =>
              confirmCancel === a.id ? (
                <div key={a.id} className="p-2.5 rounded-xl border border-red-200 bg-red-50 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-red-800 font-medium">Cancel visit with {a.doctor}?</span>
                  <span className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => setConfirmCancel(null)} className="font-semibold text-slate-600 cursor-pointer">Keep</button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmCancel(null);
                        onCancel(a);
                      }}
                      className="font-bold text-red-700 cursor-pointer"
                    >
                      Cancel visit
                    </button>
                  </span>
                </div>
              ) : (
                <VisitRow key={a.id} apt={a} onCancel={() => setConfirmCancel(a.id)} />
              )
            )
          )}
          {past.length > 0 && (
            <details className="pt-1">
              <summary className="text-[10px] font-bold text-[#8A9AA0] uppercase tracking-wider cursor-pointer">Past visits ({past.length})</summary>
              <div className="space-y-1.5 mt-1.5">
                {past.map((a) => (
                  <VisitRow key={a.id} apt={a} past />
                ))}
              </div>
            </details>
          )}
        </div>
      ) : (
        <>
          {recommendation && (
            <div className="mt-2 flex items-start gap-1.5 text-[10px] text-[#3F5F4A] bg-[#DCEBE8]/60 rounded-lg px-2 py-1.5">
              <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />
              <span>
                <strong>Recommended: {recommendation.department}.</strong> {recommendation.reason}
              </span>
            </div>
          )}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-2 -mx-1 px-1 pb-0.5">
            {['All', ...departments].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDept(d)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition cursor-pointer ${
                  activeDept === d ? 'bg-[#0F3B3F] text-white border-[#0F3B3F]' : 'bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50'
                }`}
              >
                {d}
                {recommendation?.department === d && ' ★'}
              </button>
            ))}
          </div>
          <label className="mt-2 h-8 rounded-full bg-slate-100 flex items-center gap-1.5 px-3">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or condition (e.g. vitiligo)"
              className="bg-transparent text-[11px] w-full focus:outline-none"
            />
          </label>
          <div className="flex-1 overflow-y-auto pr-1 mt-2 divide-y divide-slate-100">
            {visible.length === 0 && <p className="text-[11px] text-[#8A9AA0] text-center py-6">No providers match.</p>}
            {visible.map((doc) => {
              const available = doc.status === 'Available' && doc.slots.length > 0;
              return (
                <div key={doc.id} className="py-2 flex items-center gap-2.5">
                  <DoctorAvatar doctor={doc} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#1F2A2E] truncate">{doc.name}</div>
                    <div className="text-[10px] text-[#647C7C] truncate">{doc.specialty}</div>
                    <div className="text-[10px] text-[#8A9AA0] flex items-center gap-1.5 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {doc.rating} ({doc.reviews})
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-[#2FBF71]' : 'bg-[#E5484D]'}`} />
                      <span className="truncate">{available ? `Next: ${formatSlot(doc.nextAvailable)}` : 'Not taking bookings'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onBook(doc)}
                    disabled={!available}
                    className="h-7 px-3 rounded-full text-[10px] font-bold flex items-center gap-1 transition shrink-0 bg-[#0F3B3F] hover:bg-[#1F6A66] text-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <CalendarPlus className="w-3 h-3" /> Book
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
