import React, { useState } from 'react';
import { X, Calendar, Clock, FileText, CheckCircle, UserCheck } from 'lucide-react';

export default function BookModal({ isOpen, onClose, doctor, onConfirm }) {
  const [selectedSlot, setSelectedSlot] = useState(doctor?.slots?.[0] || 'Tomorrow, 10:15 AM');
  const [attachReport, setAttachReport] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !doctor) return null;

  const handleBooking = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm({
        id: `apt-${Date.now()}`,
        doctor: doctor.name,
        date: selectedSlot,
        department: doctor.department,
        type: 'Dermatological Review',
        reportAttached: attachReport
      });
      setConfirmed(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/70 rounded-[28px] max-w-md w-full p-6 shadow-2xl relative text-[#1F2A2E]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <h3 className="text-base font-semibold text-[#1F2A2E]">{doctor.name}</h3>
            <p className="text-xs text-[#8A9AA0]">{doctor.specialty} • {doctor.department}</p>
          </div>
        </div>

        {confirmed ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#1F2A2E]">Appointment Confirmed!</h4>
            <p className="text-xs text-[#8A9AA0] max-w-xs mx-auto">
              Scheduled with {doctor.name} for {selectedSlot}. A calendar invite and encrypted dossier have been dispatched.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#1F2A2E] mb-2 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#3F5F4A]" /> Select Available Slot
              </label>
              <div className="space-y-1.5">
                {doctor.slots?.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between border ${
                      selectedSlot === slot
                        ? 'border-[#3F5F4A] bg-[#DCEBE8]/40 text-[#1F2A2E]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{slot}</span>
                    {selectedSlot === slot && <UserCheck className="w-4 h-4 text-[#3F5F4A]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F3B3F]" />
                <div>
                  <div className="text-xs font-semibold text-[#1F2A2E]">Attach DermaTrack Report</div>
                  <div className="text-[10px] text-[#8A9AA0]">Includes timeline, scans & adherence</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={attachReport}
                onChange={(e) => setAttachReport(e.target.checked)}
                className="w-4 h-4 rounded text-[#3F5F4A] focus:ring-[#3F5F4A] cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBooking}
                className="px-5 py-2 text-xs font-medium text-white bg-[#0F3B3F] hover:bg-[#1F6A66] rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                <Calendar className="w-3.5 h-3.5" /> Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
