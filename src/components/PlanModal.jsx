import React, { useState } from 'react';
import { X, CalendarPlus, ClipboardList } from 'lucide-react';

export default function PlanModal({ isOpen, onClose, onAddPlan }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Assessment');
  const [dateRange, setDateRange] = useState('Next 7 days');
  const [bullet1, setBullet1] = useState('');
  const [bullet2, setBullet2] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    onAddPlan({
      id: `step-${Date.now()}`,
      category,
      title,
      dateRange,
      status: 'Custom Plan',
      bullets: [bullet1 || 'Routine monitoring checklist', bullet2 || 'Review symptoms with clinician']
    });
    onClose();
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

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#0F3B3F] text-white flex items-center justify-center">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#1F2A2E]">Create Personalized Care Plan</h3>
            <p className="text-xs text-[#8A9AA0]">Add therapeutic steps and milestone routines</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#1F2A2E] block mb-1">Plan Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. UV-Barrier Sunscreen Protocol"
              className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3F5F4A]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-[#1F2A2E] block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3F5F4A]"
              >
                <option value="Assessment">Assessment</option>
                <option value="Testing">Testing</option>
                <option value="Specialists">Specialists</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Exercise">Exercise</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1F2A2E] block mb-1">Schedule / Range</label>
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="e.g. Daily at 8 AM"
                className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3F5F4A]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1F2A2E] block mb-1">Action Step 1</label>
            <input
              type="text"
              value={bullet1}
              onChange={(e) => setBullet1(e.target.value)}
              placeholder="e.g. Apply broad spectrum SPF 50 15 min prior"
              className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3F5F4A]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1F2A2E] block mb-1">Action Step 2</label>
            <input
              type="text"
              value={bullet2}
              onChange={(e) => setBullet2(e.target.value)}
              placeholder="e.g. Re-apply every 2 hours if outdoors"
              className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3F5F4A]"
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
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-[#0F3B3F] hover:bg-[#1F6A66] rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <CalendarPlus className="w-3.5 h-3.5" /> Add to Care Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
