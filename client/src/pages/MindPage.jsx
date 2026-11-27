import React, { useState } from 'react';
import { Brain, Trash2 } from 'lucide-react';
import { insightsApi, moodApi } from '../api';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState, ErrorBanner, SafetyNotice } from '../components/ui/Feedback';
import { LineChart } from '../components/ui/LineChart';
import { MoodForm } from '../components/mind/MoodForm';
import { CorrelationCard } from '../components/mind/CorrelationCard';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../hooks/useToast';
import { moodEmoji, shortDate } from '../utils/format';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function StatTile({ label, value }) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
      <div className="text-lg font-bold text-[#1F2A2E] capitalize">{value ?? '—'}</div>
      <div className="text-[10px] text-[#8A9AA0] uppercase font-semibold tracking-wider">{label}</div>
    </div>
  );
}

async function loadMind() {
  const [patterns, history, correlations] = await Promise.all([moodApi.patterns(30), moodApi.history(30), insightsApi.correlations()]);
  return { patterns, history, correlations };
}

export default function MindPage() {
  const showToast = useToast();
  const { data, error, reload, setData } = useAsync(loadMind, []);
  const [support, setSupport] = useState(null);
  const patterns = data?.patterns;
  const series = patterns?.series || [];

  const logMood = async (entry) => {
    try {
      const created = await moodApi.log(entry);
      setSupport(created.support || null);
      showToast('Mood entry saved.');
      reload();
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const remove = async (id) => {
    try {
      await moodApi.remove(id);
      setData((d) => ({ ...d, history: d.history.filter((m) => m.id !== id) }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AppShell title="Mind & mood" subtitle="Your emotional wellbeing and how it shows up in your skin">
      <ErrorBanner error={error} onRetry={reload} />

      <div className="grid grid-cols-12 gap-2.5">
        <div className="col-span-12 lg:col-span-7 solid-card">
          <h3 className="text-sm font-semibold mb-3">How are you feeling?</h3>
          <MoodForm onSubmit={logMood} />
          {support && (
            <div className="mt-3">
              <SafetyNotice resources={support} />
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-5 solid-card space-y-3">
          <h3 className="text-sm font-semibold">Last 30 days</h3>
          <div className="grid grid-cols-4 gap-2">
            <StatTile label="Avg mood" value={patterns?.averageMood} />
            <StatTile label="Avg stress" value={patterns?.averageStress} />
            <StatTile label="Streak" value={patterns ? `${patterns.streakDays}d` : null} />
            <StatTile label="Trend" value={patterns?.trend?.replace('insufficient-data', '—')} />
          </div>
          <div>
            <div className="text-[10px] text-[#8A9AA0] uppercase font-semibold mb-1">Average mood by weekday</div>
            <div className="flex items-end justify-between h-16 px-1">
              {WEEKDAYS.map((d) => {
                const v = patterns?.byWeekday?.[d];
                return (
                  <div key={d} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-4 rounded-t bg-[#3F5F4A]/80" style={{ height: `${(v || 0) * 5}px` }} title={v ? `${v}/10` : 'No data'} />
                    <span className="text-[9px] text-[#8A9AA0] font-semibold">{d}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[11px] space-y-0.5">
            <div><strong>Frequent emotions:</strong> {patterns?.topEmotions?.join(', ') || '—'}</div>
            <div><strong>Reported triggers:</strong> {patterns?.topTriggers?.join(', ') || '—'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2.5">
        <div className="col-span-12 lg:col-span-7 solid-card">
          <h3 className="text-sm font-semibold">Mood (green) & stress (purple)</h3>
          {series.length ? (
            <div className="space-y-2 mt-2">
              <LineChart height={70} min={1} max={10} stroke="#3F5F4A" points={series.map((p) => ({ label: shortDate(p.date), value: p.mood }))} />
              <LineChart height={70} min={1} max={10} stroke="#B98CE8" points={series.map((p) => ({ label: shortDate(p.date), value: p.stress }))} />
            </div>
          ) : (
            <EmptyState icon={Brain} title="No mood data yet">Log how you feel to see trends here.</EmptyState>
          )}
        </div>
        <div className="col-span-12 lg:col-span-5">
          <CorrelationCard correlations={data?.correlations} />
        </div>
      </div>

      <div className="solid-card">
        <h3 className="text-sm font-semibold mb-2">Journal</h3>
        {data?.history?.length ? (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {data.history.map((m) => (
              <div key={m.id} className="py-2 flex items-start gap-3">
                <span className="text-xl" aria-hidden>{moodEmoji(m.moodScore)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">
                    Mood {m.moodScore}/10 · Stress {m.stressLevel}/10
                    {m.source === 'solace' && <span className="ml-2 text-[10px] text-[#1F6A66] bg-[#DCEBE8] px-1.5 rounded">Solace</span>}
                  </div>
                  <div className="text-[11px] text-[#8A9AA0]">
                    {m.relativeTime}
                    {m.emotions.length > 0 && ` · ${m.emotions.join(', ')}`}
                  </div>
                  {m.note && <p className="text-[11px] text-[#1F2A2E] mt-0.5">{m.note}</p>}
                </div>
                <button type="button" onClick={() => remove(m.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer" aria-label="Delete entry">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-[#8A9AA0]">No entries in the last 30 days.</p>
        )}
      </div>
    </AppShell>
  );
}
