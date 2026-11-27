import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { SafetyNotice } from '../ui/Feedback';
import { moodEmoji } from '../../utils/format';

const QUICK_EMOTIONS = ['calm', 'stressed', 'anxious', 'tired', 'hopeful', 'frustrated'];

function Slider({ label, value, onChange, accent }) {
  return (
    <label className="block">
      <div className="flex justify-between text-[11px] font-medium text-[#1F2A2E]">
        <span>{label}</span>
        <span className="font-bold">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: accent }}
      />
    </label>
  );
}

/** One-tap daily mood/stress check-in. */
export function MoodCheckInCard({ moodSummary, onLogMood }) {
  const [mood, setMood] = useState(6);
  const [stress, setStress] = useState(5);
  const [emotions, setEmotions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [support, setSupport] = useState(null);

  const toggleEmotion = (e) => setEmotions((list) => (list.includes(e) ? list.filter((x) => x !== e) : [...list, e]));

  const submit = async () => {
    setSaving(true);
    const created = await onLogMood({ moodScore: mood, stressLevel: stress, emotions });
    setSaving(false);
    if (created) {
      setEmotions([]);
      setSupport(created.support || null);
    }
  };

  return (
    <div className="solid-card min-h-[280px] lg:h-[300px] flex flex-col justify-between">
      <div className="flex items-start justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Mood Check-in</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">How are you feeling right now?</p>
        </div>
        {moodSummary?.streakDays > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <Flame className="w-3 h-3" /> {moodSummary.streakDays}-day streak
          </span>
        )}
      </div>

      {support ? (
        <div className="flex-1 py-2 overflow-y-auto">
          <SafetyNotice resources={support} />
        </div>
      ) : (
        <div className="space-y-2 py-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>{moodEmoji(mood)}</span>
            <div className="flex-1 space-y-1">
              <Slider label="Mood" value={mood} onChange={setMood} accent="#3F5F4A" />
              <Slider label="Stress" value={stress} onChange={setStress} accent="#B98CE8" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {QUICK_EMOTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => toggleEmotion(e)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition cursor-pointer capitalize ${
                  emotions.includes(e) ? 'bg-[#0F3B3F] text-white border-[#0F3B3F]' : 'bg-white text-[#1F2A2E] border-slate-200 hover:bg-slate-50'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
        <span className="text-[#8A9AA0] font-medium">
          {moodSummary?.average != null ? `Avg mood ${moodSummary.average}/10 · ${moodSummary.trend}` : 'No mood logs yet'}
        </span>
        {support ? (
          <button type="button" onClick={() => setSupport(null)} className="font-bold text-[#0F3B3F] hover:underline cursor-pointer">
            Done
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/mind" className="text-[#8A9AA0] hover:text-[#1F2A2E] font-semibold">Details</Link>
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="px-3 py-1 rounded-full bg-[#0F3B3F] hover:bg-[#1F6A66] text-white font-semibold disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Saving…' : 'Log mood'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
