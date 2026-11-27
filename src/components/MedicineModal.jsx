import React, { useState } from 'react';
import { X, Pill, Plus, Check, Clock } from 'lucide-react';

export default function MedicineModal({ isOpen, onClose, medicines, onToggleMed, onAddMed }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('Morning');
  const [area, setArea] = useState('Forearm lesion');

  if (!isOpen) return null;

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!name) return;
    onAddMed({
      id: `med-${Date.now()}`,
      name,
      dosage: dosage || 'Standard application',
      timing,
      frequency: 'Daily',
      takenToday: false,
      totalDoses: 1,
      takenDoses: 0,
      area,
      refillDate: '30 days remaining'
    });
    setName('');
    setDosage('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/70 rounded-[28px] max-w-lg w-full p-6 shadow-2xl relative text-[#1F2A2E]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between mb-4 pr-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1F2A2E]">Dermatological Prescriptions</h3>
              <p className="text-xs text-[#8A9AA0]">Schedule, dosing compliance & refills</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1F2A2E] font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> {showAddForm ? 'Close' : 'Add'}
          </button>
        </div>

        {showAddForm ? (
          <form onSubmit={handleAddNew} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mb-4">
            <div>
              <label className="text-[11px] font-semibold text-[#1F2A2E] block mb-1">Medication Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Clobetasol Propionate 0.05%"
                className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3F5F4A]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[#1F2A2E] block mb-1">Dosage</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 1 thin film"
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3F5F4A]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#1F2A2E] block mb-1">Timing</label>
                <input
                  type="text"
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  placeholder="e.g. Bedtime"
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3F5F4A]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#3F5F4A] hover:bg-[#2FBF71] text-white text-xs font-medium rounded-xl transition shadow-sm"
            >
              Add to Regimen
            </button>
          </form>
        ) : null}

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {medicines.map((med) => (
            <div
              key={med.id}
              className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-slate-300 transition"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleMed(med.id)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                    med.takenToday
                      ? 'bg-[#2FBF71] text-white'
                      : 'border-2 border-slate-300 text-transparent hover:border-[#3F5F4A]'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
                <div>
                  <div className="text-xs font-semibold text-[#1F2A2E]">{med.name}</div>
                  <div className="text-[10px] text-[#8A9AA0]">
                    {med.dosage} • {med.frequency} ({med.timing})
                  </div>
                  <div className="text-[10px] text-teal-700/80 font-medium">{med.area}</div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    med.takenToday
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {med.takenToday ? 'Taken' : 'Pending'}
                </span>
                <div className="text-[9px] text-[#8A9AA0] mt-1 flex items-center justify-end gap-1">
                  <Clock className="w-2.5 h-2.5" /> Refill: {med.refillDate}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#8A9AA0]">
          <span>Tracked Doses: {medicines.filter((m) => m.takenToday).length} / {medicines.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
