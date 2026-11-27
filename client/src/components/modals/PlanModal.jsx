import React, { useState } from 'react';
import { CalendarPlus, ClipboardList } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { buttonClass, inputClass, labelClass } from '../ui/classes';

const CATEGORIES = ['Assessment', 'Testing', 'Specialists', 'Nutrition', 'Exercise'];
const EMPTY = { title: '', category: 'Assessment', dateRange: 'Next 7 days', step1: '', step2: '' };

export default function PlanModal({ isOpen, onClose, onAddPlan }) {
  const [form, setForm] = useState(EMPTY);
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onAddPlan({
      title: form.title.trim(),
      category: form.category,
      dateRange: form.dateRange.trim(),
      status: 'Custom Plan',
      bullets: [form.step1, form.step2].map((b) => b.trim()).filter(Boolean)
    });
    setForm(EMPTY);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" icon={ClipboardList} title="Add to care plan" subtitle="Treatments, tests and routines to track">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="plan-title">Title</label>
          <input id="plan-title" required className={inputClass} value={form.title} onChange={update('title')} placeholder="e.g. Daily SPF 50 protocol" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass} htmlFor="plan-category">Category</label>
            <select id="plan-category" className={inputClass} value={form.category} onChange={update('category')}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="plan-range">Schedule</label>
            <input id="plan-range" className={inputClass} value={form.dateRange} onChange={update('dateRange')} placeholder="e.g. Daily at 8 AM" />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-step1">Action step 1</label>
          <input id="plan-step1" className={inputClass} value={form.step1} onChange={update('step1')} placeholder="e.g. Apply 15 min before going out" />
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-step2">Action step 2</label>
          <input id="plan-step2" className={inputClass} value={form.step2} onChange={update('step2')} placeholder="e.g. Re-apply every 2 hours outdoors" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={buttonClass.ghost}>Cancel</button>
          <button type="submit" className={buttonClass.primary}>
            <CalendarPlus className="w-3.5 h-3.5" /> Add step
          </button>
        </div>
      </form>
    </Modal>
  );
}
