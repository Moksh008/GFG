import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { buttonClass } from '../ui/classes';

const chip = (active) =>
  `text-[11px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
    active ? 'bg-[#0F3B3F] text-white border-[#0F3B3F]' : 'bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50'
  }`;

function QuestionInput({ q, value, onChange }) {
  switch (q.type) {
    case 'scale':
      return (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={q.min}
            max={q.max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: '#3F5F4A' }}
          />
          <span className="text-xs font-bold w-10 text-right">{value}/{q.max}</span>
        </div>
      );
    case 'boolean':
      return (
        <div className="flex gap-1.5">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" onClick={() => onChange(v)} className={chip(value === v)}>
              {v ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      );
    case 'multi':
      return (
        <div className="flex flex-wrap gap-1.5">
          {q.options.map((o) => {
            const list = value || [];
            const active = list.includes(o);
            return (
              <button key={o} type="button" onClick={() => onChange(active ? list.filter((x) => x !== o) : [...list, o])} className={chip(active)}>
                {o}
              </button>
            );
          })}
        </div>
      );
    default: // choice
      return (
        <div className="flex flex-wrap gap-1.5">
          {q.options.map((o) => (
            <button key={o} type="button" onClick={() => onChange(o)} className={chip(value === o)}>
              {o}
            </button>
          ))}
        </div>
      );
  }
}

/** Renders the condition-specific follow-up questions returned with a scan. */
const scaleDefaults = (questions) =>
  Object.fromEntries(questions.filter((q) => q.type === 'scale').map((q) => [q.id, Math.round((q.min + q.max) / 2)]));

export function QuestionnaireForm({ questions, onSubmit, onSkip, submitLabel = 'Get my consultation' }) {
  // Sliders show a value, so pre-fill them — what the user sees is what gets submitted.
  const [answers, setAnswers] = useState(() => scaleDefaults(questions));
  const [saving, setSaving] = useState(false);
  const answered = Object.keys(answers).length;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(answers);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {questions.map((q) => (
        <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs font-medium text-[#1F2A2E] mb-2">{q.question}</div>
          <QuestionInput q={q} value={answers[q.id]} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-1">
        {onSkip && (
          <button type="button" onClick={onSkip} className={buttonClass.ghost}>
            Skip
          </button>
        )}
        <button type="submit" disabled={!answered || saving} className={buttonClass.primary}>
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
