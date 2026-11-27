import React, { useState } from 'react';
import { Check, Clock, Pill, Plus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { buttonClass, inputClass, labelClass } from '../ui/classes';

const EMPTY = { name: '', dosage: '', timing: 'Morning', area: '', totalDoses: 1 };

function AddMedicineForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const doses = Number(form.totalDoses) || 1;
    onAdd({
      name: form.name.trim(),
      dosage: form.dosage.trim() || 'Standard application',
      timing: form.timing.trim() || 'Morning',
      frequency: `${doses}x Daily`,
      totalDoses: doses,
      area: form.area.trim()
    });
    setForm(EMPTY);
  };

  return (
    <form onSubmit={submit} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mb-4">
      <div>
        <label className={labelClass} htmlFor="med-name">Medication name</label>
        <input id="med-name" required className={inputClass} value={form.name} onChange={update('name')} placeholder="e.g. Clobetasol Propionate 0.05%" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={labelClass} htmlFor="med-dosage">Dosage</label>
          <input id="med-dosage" className={inputClass} value={form.dosage} onChange={update('dosage')} placeholder="Thin film" />
        </div>
        <div>
          <label className={labelClass} htmlFor="med-timing">Timing</label>
          <input id="med-timing" className={inputClass} value={form.timing} onChange={update('timing')} placeholder="Bedtime" />
        </div>
        <div>
          <label className={labelClass} htmlFor="med-doses">Doses/day</label>
          <input id="med-doses" type="number" min="1" max="12" className={inputClass} value={form.totalDoses} onChange={update('totalDoses')} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="med-area">Applied to</label>
        <input id="med-area" className={inputClass} value={form.area} onChange={update('area')} placeholder="e.g. Forearm lesion" />
      </div>
      <button type="submit" className={`${buttonClass.success} w-full`}>Add to regimen</button>
    </form>
  );
}

export default function MedicineModal({ isOpen, onClose, medicines, onToggleMed, onAddMed }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      icon={Pill}
      iconClass="bg-amber-100 text-amber-700"
      title="Medications"
      subtitle="Tick off today's doses · manage your regimen"
      headerAction={
        <button type="button" onClick={() => setShowForm((v) => !v)} className={`${buttonClass.subtle} rounded-full`}>
          <Plus className="w-3.5 h-3.5" /> {showForm ? 'Close' : 'Add'}
        </button>
      }
    >
      {showForm && (
        <AddMedicineForm
          onAdd={(med) => {
            onAddMed(med);
            setShowForm(false);
          }}
        />
      )}

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {medicines.length === 0 && <p className="text-xs text-[#8A9AA0] text-center py-6">No medications yet — add one above.</p>}
        {medicines.map((med) => (
          <div key={med.id} className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleMed(med.id)}
                aria-label={med.takenToday ? `Mark ${med.name} as not taken` : `Mark ${med.name} as taken`}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition cursor-pointer ${
                  med.takenToday ? 'bg-[#2FBF71] text-white' : 'border-2 border-slate-300 text-transparent hover:border-[#3F5F4A]'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
              <div>
                <div className="text-xs font-semibold text-[#1F2A2E]">{med.name}</div>
                <div className="text-[10px] text-[#8A9AA0]">
                  {med.dosage} · {med.frequency} ({med.timing})
                </div>
                {med.area && <div className="text-[10px] text-teal-700/80 font-medium">{med.area}</div>}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                  med.takenToday ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {med.takenToday ? 'Taken' : `${med.takenDoses}/${med.totalDoses}`}
              </span>
              {med.refillDate && (
                <div className="text-[9px] text-[#8A9AA0] mt-1 flex items-center justify-end gap-1">
                  <Clock className="w-2.5 h-2.5" /> Refill {med.refillDate}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#8A9AA0]">
        <span>
          Completed today: {medicines.filter((m) => m.takenToday).length} / {medicines.length}
        </span>
        <button type="button" onClick={onClose} className={buttonClass.primary}>Done</button>
      </div>
    </Modal>
  );
}
