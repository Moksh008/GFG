import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Stethoscope } from 'lucide-react';

const URGENCY = {
  routine: { label: 'Routine self-care', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  soon: { label: 'See a dermatologist soon', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  urgent: { label: 'Seek medical care promptly', cls: 'bg-rose-50 text-rose-700 border-rose-200' }
};

/** Personalised consultation generated from the scan + questionnaire answers. */
export function ConsultationCard({ consultation }) {
  if (!consultation) return null;
  const urgency = URGENCY[consultation.urgency] || URGENCY.routine;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Stethoscope className="w-4 h-4 text-[#3F5F4A]" />
        <span className="text-sm font-semibold">Your consultation</span>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgency.cls}`}>{urgency.label}</span>
      </div>
      <p className="text-xs leading-relaxed text-[#1F2A2E]">{consultation.assessment}</p>
      <ul className="space-y-1">
        {consultation.recommendations.map((r) => (
          <li key={r} className="text-xs flex gap-1.5">
            <span className="text-[#3F5F4A]">✓</span>
            {r}
          </li>
        ))}
      </ul>
      {consultation.mental_health_note && (
        <div className="p-3 rounded-xl bg-[#DCEBE8]/50 border border-[#A9C1CC]/50 text-xs flex gap-2">
          <HeartHandshake className="w-4 h-4 text-[#1F6A66] shrink-0" />
          <span>
            {consultation.mental_health_note}{' '}
            <Link to="/solace" className="font-semibold text-[#0F3B3F] underline">Talk to Solace</Link>
          </span>
        </div>
      )}
    </div>
  );
}
