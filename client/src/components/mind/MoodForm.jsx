import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { buttonClass, inputClass, labelClass } from '../ui/classes';
import { moodEmoji } from '../../utils/format';

const EMOTIONS = ['calm', 'hopeful', 'content', 'stressed', 'anxious', 'tired', 'frustrated', 'embarrassed', 'sad', 'overwhelmed'];
const TRIGGERS = ['work', 'poor sleep', 'sweat', 'heat', 'dry weather', 'new product', 'diet', 'social event'];
const INITIAL = { moodScore: 6, stressLevel: 5, sleepHours: 7, itchLevel: 3, emotions: [], triggers: [], note: '' };

function Range({ label, value, min = 1, max = 10, step = 1, suffix = `/${max}`, accent, onChange }) {
  return (
    <label className="block">
      <div className="flex justify-between text-xs font-medium text-[#1F2A2E]">
        <span>{label}</span>
        <span className="font-bold">{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" style={{ accentColor: accent }} />
    </label>
  );
}

function ChipGroup({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onToggle(o)}
          className={`text-[11px] px-2.5 py-1 rounded-full border capitalize transition cursor-pointer ${
            selected.includes(o) ? 'bg-[#0F3B3F] text-white border-[#0F3B3F]' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Detailed mood entry: mood, stress, sleep, itch, emotions, triggers and a note. */
export function MoodForm({ onSubmit }) {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const toggle = (field) => (value) =>
    setForm((f) => ({ ...f, [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value] }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSubmit({ ...form, note: form.note.trim() });
    setSaving(false);
    if (ok) setForm(INITIAL);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-4xl" aria-hidden>{moodEmoji(form.moodScore)}</span>
        <div className="flex-1 grid sm:grid-cols-2 gap-x-4 gap-y-1">
          <Range label="Mood" value={form.moodScore} onChange={set('moodScore')} accent="#3F5F4A" />
          <Range label="Stress" value={form.stressLevel} onChange={set('stressLevel')} accent="#B98CE8" />
          <Range label="Sleep" value={form.sleepHours} min={0} max={12} step={0.5} suffix=" h" onChange={set('sleepHours')} accent="#1F6A66" />
          <Range label="Itch" value={form.itchLevel} min={0} onChange={set('itchLevel')} accent="#F2C98A" />
        </div>
      </div>
      <div>
        <div className={labelClass}>Emotions</div>
        <ChipGroup options={EMOTIONS} selected={form.emotions} onToggle={toggle('emotions')} />
      </div>
      <div>
        <div className={labelClass}>Possible triggers</div>
        <ChipGroup options={TRIGGERS} selected={form.triggers} onToggle={toggle('triggers')} />
      </div>
      <div>
        <label className={labelClass} htmlFor="mood-note">Journal note</label>
        <textarea
          id="mood-note"
          rows={2}
          className={`${inputClass} resize-none`}
          value={form.note}
          onChange={(e) => set('note')(e.target.value)}
          placeholder="What's on your mind? How is your skin making you feel?"
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={buttonClass.primary}>
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save entry
        </button>
      </div>
    </form>
  );
}
