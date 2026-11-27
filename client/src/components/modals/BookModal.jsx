import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, FileText, Loader2, UserCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { buttonClass } from '../ui/classes';

/** Pick a slot with a provider; confirmation is shown only after the API accepts the booking. */
export default function BookModal({ isOpen, onClose, doctor, onConfirm }) {
  const [selectedSlot, setSelectedSlot] = useState(doctor?.slots?.[0] || '');
  const [slotDoctorId, setSlotDoctorId] = useState(doctor?.id);
  const [attachReport, setAttachReport] = useState(true);
  const [status, setStatus] = useState('idle'); // idle | saving | confirmed

  // The modal stays mounted between doctors; reset when a different doctor is chosen.
  if (doctor && doctor.id !== slotDoctorId) {
    setSlotDoctorId(doctor.id);
    setSelectedSlot(doctor.slots?.[0] || '');
    setStatus('idle');
  }

  if (!doctor) return null;

  const close = () => {
    setStatus('idle');
    onClose();
  };

  const book = async () => {
    setStatus('saving');
    const created = await onConfirm({ doctorId: doctor.id, slot: selectedSlot, reportAttached: attachReport });
    setStatus(created ? 'confirmed' : 'idle');
  };

  return (
    <Modal isOpen={isOpen} onClose={close} size="sm" title="Book an appointment" icon={Calendar}>
      <div className="flex items-center gap-3 mb-4">
        <img src={doctor.avatar} alt={doctor.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
        <div>
          <div className="text-sm font-semibold text-[#1F2A2E]">{doctor.name}</div>
          <p className="text-xs text-[#8A9AA0]">{doctor.specialty} · {doctor.department}</p>
        </div>
      </div>

      {status === 'confirmed' ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#1F2A2E]">Appointment confirmed</h4>
          <p className="text-xs text-[#8A9AA0] max-w-xs mx-auto">
            You're booked with {doctor.name} for {selectedSlot}.{attachReport && ' Your Dermora report will be shared.'}
          </p>
          <button type="button" onClick={close} className={buttonClass.primary}>Done</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-[#1F2A2E] mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#3F5F4A]" /> Select an available slot
            </div>
            <div className="space-y-1.5">
              {doctor.slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between border cursor-pointer ${
                    selectedSlot === slot ? 'border-[#3F5F4A] bg-[#DCEBE8]/40 text-[#1F2A2E]' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{slot}</span>
                  {selectedSlot === slot && <UserCheck className="w-4 h-4 text-[#3F5F4A]" />}
                </button>
              ))}
            </div>
          </div>

          <label className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F3B3F]" />
              <span>
                <span className="text-xs font-semibold text-[#1F2A2E] block">Attach Dermora report</span>
                <span className="text-[10px] text-[#8A9AA0]">Scans, mood trends & adherence</span>
              </span>
            </span>
            <input type="checkbox" checked={attachReport} onChange={(e) => setAttachReport(e.target.checked)} className="w-4 h-4" />
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} className={buttonClass.ghost}>Cancel</button>
            <button type="button" onClick={book} disabled={!selectedSlot || status === 'saving'} className={buttonClass.primary}>
              {status === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
              Confirm booking
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
