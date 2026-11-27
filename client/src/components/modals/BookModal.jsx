import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle, Clock, FileText, Loader2, MapPin, Star, Video } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { buttonClass, inputClass, labelClass } from '../ui/classes';
import { DoctorAvatar } from '../dashboard/AppointmentsCard';
import { formatSlot, parseSlot, slotDay, slotTime } from '../../utils/format';

const VISIT_TYPES = [
  { value: 'In-person visit', label: 'In person', icon: MapPin },
  { value: 'Video consultation', label: 'Video call', icon: Video }
];

/** Group "YYYY-MM-DDTHH:MM" slots by day, preserving order. */
function byDay(slots) {
  const map = new Map();
  slots.forEach((s) => {
    const key = s.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  });
  return [...map.entries()];
}

/** Pick a day + time with a provider; confirmation is shown only after the API accepts the booking. */
export default function BookModal({ isOpen, onClose, doctor, onConfirm, defaultReason = '' }) {
  const [doctorId, setDoctorId] = useState(null);
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState('');
  const [type, setType] = useState(VISIT_TYPES[0].value);
  const [reason, setReason] = useState('');
  const [attachReport, setAttachReport] = useState(true);
  const [status, setStatus] = useState('idle'); // idle | saving | confirmed
  const days = useMemo(() => byDay(doctor?.slots || []), [doctor]);

  // The modal stays mounted between doctors; reset when a different doctor is chosen.
  if (doctor && doctor.id !== doctorId) {
    setDoctorId(doctor.id);
    setDay(null);
    setSlot('');
    setReason(defaultReason);
    setStatus('idle');
  }
  if (!doctor) return null;

  const activeDay = day || days[0]?.[0];
  const times = days.find(([d]) => d === activeDay)?.[1] || [];

  const close = () => {
    setStatus('idle');
    setDoctorId(null);
    onClose();
  };

  const book = async () => {
    setStatus('saving');
    const created = await onConfirm({ doctorId: doctor.id, slot, reportAttached: attachReport, type, notes: reason.trim() });
    setStatus(created ? 'confirmed' : 'idle');
    if (!created) setSlot('');
  };

  return (
    <Modal isOpen={isOpen} onClose={close} size="md" title="Book an appointment" icon={Calendar}>
      <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
        <DoctorAvatar doctor={doctor} size="w-12 h-12" />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[#1F2A2E] truncate">{doctor.name}</div>
          <p className="text-xs text-[#647C7C] truncate">{doctor.title} · {doctor.department}</p>
          <p className="text-[11px] text-[#8A9AA0] flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {doctor.rating} · {doctor.reviews} reviews · {doctor.specialty}
          </p>
        </div>
      </div>

      {status === 'confirmed' ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#1F2A2E]">Appointment confirmed</h4>
          <p className="text-xs text-[#8A9AA0] max-w-xs mx-auto">
            {type} with {doctor.name} on {formatSlot(slot)}.{attachReport && ' Your Dermora report will be shared.'}
          </p>
          <button type="button" onClick={close} className={buttonClass.primary}>Done</button>
        </div>
      ) : days.length === 0 ? (
        <p className="text-xs text-[#8A9AA0] text-center py-8">No open slots in the next week. Please try another specialist.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-[#1F2A2E] mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#3F5F4A]" /> Choose a day
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {days.map(([d, list]) => {
                const date = parseSlot(list[0]);
                const active = d === activeDay;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDay(d);
                      setSlot('');
                    }}
                    className={`shrink-0 w-16 rounded-xl border py-2 text-center transition cursor-pointer ${
                      active ? 'bg-[#0F3B3F] border-[#0F3B3F] text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-[#1F2A2E]'
                    }`}
                  >
                    <div className="text-[10px] font-semibold opacity-80">{slotDay(list[0]).replace(/,.*/, '').slice(0, 8)}</div>
                    <div className="text-lg font-bold leading-tight">{date.getDate()}</div>
                    <div className={`text-[9px] font-semibold ${active ? 'opacity-80' : 'text-[#8A9AA0]'}`}>{list.length} open</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#1F2A2E] mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#3F5F4A]" /> Choose a time
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {times.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSlot(t)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    slot === t ? 'border-[#3F5F4A] bg-[#DCEBE8] text-[#0F3B3F]' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {slotTime(t)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className={labelClass}>Visit type</div>
            <div className="grid grid-cols-2 gap-2">
              {VISIT_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    type === value ? 'border-[#3F5F4A] bg-[#DCEBE8] text-[#0F3B3F]' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="book-reason">Reason for visit</label>
            <textarea
              id="book-reason"
              rows={2}
              maxLength={500}
              className={`${inputClass} resize-none`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Itchy patch on forearm not improving"
            />
          </div>

          <label className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F3B3F]" />
              <span>
                <span className="text-xs font-semibold text-[#1F2A2E] block">Share my Dermora report</span>
                <span className="text-[10px] text-[#8A9AA0]">Scans, area changes, medication & mood</span>
              </span>
            </span>
            <input type="checkbox" checked={attachReport} onChange={(e) => setAttachReport(e.target.checked)} className="w-4 h-4" />
          </label>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" onClick={close} className={buttonClass.ghost}>Cancel</button>
            <button type="button" onClick={book} disabled={!slot || status === 'saving'} className={buttonClass.primary}>
              {status === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
              {slot ? `Confirm ${formatSlot(slot)}` : 'Pick a time'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
