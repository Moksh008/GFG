import React, { useState } from 'react';
import { CalendarClock, Check, Pill, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { buttonClass, inputClass, labelClass } from '../ui/classes';

const DOSAGE_PRESETS = ['Thin layer', 'Pea-sized amount', '1 tablet', '2 tablets', '5 ml', '1 capsule'];
const TIMINGS = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];
const FREQUENCIES = [1, 2, 3, 4];

const EMPTY = { name: '', dosage: '', doses: 1, timings: ['Morning'], area: '', refillDate: '' };

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
        active ? 'bg-[#0F3B3F] text-white border-[#0F3B3F]' : 'bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function AddMedicineForm({ onAdd, areaSuggestions, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleTiming = (t) =>
    set('timings', form.timings.includes(t) ? form.timings.filter((x) => x !== t) : TIMINGS.filter((x) => [...form.timings, t].includes(x)));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const created = await onAdd({
      name: form.name.trim(),
      dosage: form.dosage.trim() || 'As directed',
      timing: form.timings.join(' & ') || 'Any time',
      frequency: `${form.doses}x Daily`,
      totalDoses: form.doses,
      area: form.area.trim(),
      refillDate: form.refillDate
    });
    setSaving(false);
    if (created) setForm(EMPTY);
  };

  return (
    <form onSubmit={submit} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mb-4">
      <div>
        <label className={labelClass} htmlFor="med-name">Medicine name & strength</label>
        <input id="med-name" required maxLength={160} className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Clobetasol Propionate 0.05%" />
      </div>

      <div>
        <label className={labelClass} htmlFor="med-dosage">Dosage (per dose)</label>
        <input id="med-dosage" maxLength={120} className={inputClass} value={form.dosage} onChange={(e) => set('dosage', e.target.value)} placeholder="e.g. Thin layer, 1 tablet, 5 ml" />
        <div className="flex flex-wrap gap-1 mt-1.5">
          {DOSAGE_PRESETS.map((d) => (
            <Chip key={d} active={form.dosage === d} onClick={() => set('dosage', d)}>{d}</Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className={labelClass}>Times per day</div>
          <div className="flex gap-1">
            {FREQUENCIES.map((n) => (
              <Chip key={n} active={form.doses === n} onClick={() => set('doses', n)}>{n}×</Chip>
            ))}
          </div>
        </div>
        <div>
          <div className={labelClass}>When</div>
          <div className="flex flex-wrap gap-1">
            {TIMINGS.map((t) => (
              <Chip key={t} active={form.timings.includes(t)} onClick={() => toggleTiming(t)}>{t}</Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="med-area">Applied to / for</label>
          <input id="med-area" list="med-area-options" maxLength={160} className={inputClass} value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="e.g. Right Forearm" />
          <datalist id="med-area-options">
            {areaSuggestions.map((a) => (
              <option key={a} value={a} />
            ))}
            <option value="Oral (systemic)" />
          </datalist>
        </div>
        <div>
          <label className={labelClass} htmlFor="med-refill">Refill / course end date</label>
          <input id="med-refill" type="date" className={inputClass} value={form.refillDate} onChange={(e) => set('refillDate', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className={`${buttonClass.ghost} flex-1`}>Cancel</button>
        <button type="submit" disabled={saving || !form.name.trim()} className={`${buttonClass.success} flex-[2]`}>
          <Plus className="w-3.5 h-3.5" /> Add to regimen
        </button>
      </div>
    </form>
  );
}

function refillLabel(value) {
  if (!value) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00`) : null;
  if (!d) return `Refill ${value}`;
  const days = Math.ceil((d - new Date()) / 86400000);
  const text = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return days < 0 ? `Refill overdue (${text})` : days <= 7 ? `Refill in ${days}d (${text})` : `Refill ${text}`;
}

function MedicineRow({ med, onSetDoses, onRemove }) {
  const [confirm, setConfirm] = useState(false);
  const refill = refillLabel(med.refillDate);
  const urgent = refill && /overdue|in \dd/.test(refill);
  return (
    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[#1F2A2E]">{med.name}</div>
          <div className="text-[11px] text-[#647C7C]">
            {med.dosage} · {med.frequency} · {med.timing}
          </div>
          {med.area && <div className="text-[10px] text-teal-700/80 font-medium">For: {med.area}</div>}
          {refill && (
            <div className={`text-[10px] mt-0.5 flex items-center gap-1 font-medium ${urgent ? 'text-amber-700' : 'text-[#8A9AA0]'}`}>
              <CalendarClock className="w-3 h-3" /> {refill}
            </div>
          )}
        </div>
        {confirm ? (
          <div className="flex items-center gap-2 text-[11px] shrink-0">
            <button type="button" onClick={() => setConfirm(false)} className="text-slate-500 font-semibold cursor-pointer">Keep</button>
            <button type="button" onClick={() => onRemove(med)} className="text-red-600 font-bold cursor-pointer">Remove</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} aria-label={`Remove ${med.name}`} className="w-7 h-7 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center cursor-pointer shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
        <span className="text-[10px] font-semibold text-[#8A9AA0] uppercase tracking-wider">Today</span>
        <div className="flex gap-1">
          {Array.from({ length: med.totalDoses }, (_, i) => {
            const taken = i < med.takenDoses;
            return (
              <button
                key={i}
                type="button"
                // Tapping the last taken dose un-takes it; tapping any other sets the count up to it.
                onClick={() => onSetDoses(med.id, taken && i === med.takenDoses - 1 ? i : i + 1)}
                aria-label={`Dose ${i + 1} ${taken ? 'taken' : 'not taken'}`}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                  taken ? 'bg-[#2FBF71] text-white' : 'border-2 border-slate-300 text-slate-300 hover:border-[#3F5F4A]'
                }`}
              >
                {taken ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
              </button>
            );
          })}
        </div>
        <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold border ${med.takenToday ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {med.takenToday ? 'All taken' : `${med.takenDoses}/${med.totalDoses} taken`}
        </span>
      </div>
    </div>
  );
}

export default function MedicineModal({ isOpen, onClose, medicines, onSetDoses, onAddMed, onRemoveMed, areaSuggestions = [] }) {
  const [showForm, setShowForm] = useState(false);
  const formOpen = showForm || medicines.length === 0;
  const doneCount = medicines.filter((m) => m.takenToday).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      icon={Pill}
      iconClass="bg-amber-100 text-amber-700"
      title="Medications"
      subtitle="Track each dose · manage your regimen"
      headerAction={
        !formOpen && (
          <button type="button" onClick={() => setShowForm(true)} className={`${buttonClass.subtle} rounded-full`}>
            <Plus className="w-3.5 h-3.5" /> Add medicine
          </button>
        )
      }
    >
      {formOpen && (
        <AddMedicineForm
          areaSuggestions={areaSuggestions}
          onCancel={() => (medicines.length ? setShowForm(false) : onClose())}
          onAdd={async (med) => {
            const created = await onAddMed(med);
            if (created) setShowForm(false);
            return created;
          }}
        />
      )}

      <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
        {medicines.map((med) => (
          <MedicineRow key={med.id} med={med} onSetDoses={onSetDoses} onRemove={onRemoveMed} />
        ))}
      </div>

      {medicines.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#8A9AA0]">
          <span>Completed today: {doneCount} / {medicines.length}</span>
          <button type="button" onClick={onClose} className={buttonClass.primary}>Done</button>
        </div>
      )}
    </Modal>
  );
}
