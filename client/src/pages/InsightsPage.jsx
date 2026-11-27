import React from 'react';
import { CalendarX, FileDown, Loader2, Sparkles } from 'lucide-react';
import { careApi, insightsApi } from '../api';
import { AppShell } from '../components/layout/AppShell';
import { ErrorBanner, Spinner } from '../components/ui/Feedback';
import { buttonClass } from '../components/ui/classes';
import { CorrelationCard } from '../components/mind/CorrelationCard';
import { EnvironmentCard } from '../components/dashboard/EnvironmentCard';
import { useAsync } from '../hooks/useAsync';
import { useReportExport } from '../hooks/useReportExport';
import { useToast } from '../hooks/useToast';
import { percent } from '../utils/format';

async function loadInsights() {
  const [insights, correlations, report, appointments] = await Promise.all([
    insightsApi.insights(),
    insightsApi.correlations(),
    insightsApi.reportSummary(),
    careApi.appointments()
  ]);
  return { insights, correlations, report, appointments };
}

function Appointments({ appointments, onCancel }) {
  const upcoming = appointments.filter((a) => a.status === 'confirmed');
  return (
    <div className="solid-card">
      <h3 className="text-sm font-semibold mb-2">Appointments</h3>
      {upcoming.length === 0 ? (
        <p className="text-[11px] text-[#8A9AA0]">No upcoming appointments. Book one from the dashboard.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {upcoming.map((a) => (
            <div key={a.id} className="py-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{a.doctor}</div>
                <div className="text-[11px] text-[#8A9AA0]">
                  {a.date} · {a.type}
                  {a.reportAttached && ' · report attached'}
                </div>
              </div>
              <button type="button" onClick={() => onCancel(a.id)} className={`${buttonClass.subtle} text-rose-600 shrink-0`}>
                <CalendarX className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportPreview({ report, onExport, exporting }) {
  return (
    <div className="solid-card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Doctor-ready report</h3>
          <p className="text-[11px] text-[#8A9AA0]">Scans, medications, mood and correlations in one PDF</p>
        </div>
        <button type="button" onClick={onExport} disabled={exporting} className={buttonClass.primary}>
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />} Download PDF
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          ['Scans', report.scans.length],
          ['Medications', report.medications.length],
          ['Adherence (7d)', percent(report.adherence7d)],
          ['Mood logs', report.mood.count]
        ].map(([label, value]) => (
          <div key={label} className="p-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-base font-bold">{value}</div>
            <div className="text-[9px] text-[#8A9AA0] uppercase font-semibold tracking-wider">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#8A9AA0]">{report.disclaimer}</p>
    </div>
  );
}

export default function InsightsPage() {
  const showToast = useToast();
  const { data, error, loading, reload, setData } = useAsync(loadInsights, []);
  const { exportReport, exporting } = useReportExport();

  const cancelAppointment = async (id) => {
    try {
      const updated = await careApi.cancelAppointment(id);
      setData((d) => ({ ...d, appointments: d.appointments.map((a) => (a.id === id ? updated : a)) }));
      showToast('Appointment cancelled.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AppShell title="Insights" subtitle="What your skin, mood and routine data are telling you">
      <ErrorBanner error={error} onRetry={reload} />
      {loading && !data ? (
        <Spinner className="text-white py-24" label="Analysing your data…" />
      ) : data ? (
        <>
          <div className="solid-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#B98CE8]" />
              <h3 className="text-sm font-semibold">Your personalised overview</h3>
              {!data.insights.aiPowered && (
                <span className="text-[10px] text-[#8A9AA0] bg-slate-100 px-2 py-0.5 rounded-full">Rule-based · add a Gemini key for AI insights</span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-[#1F2A2E]">{data.insights.summary}</p>
            <ul className="mt-3 grid md:grid-cols-2 gap-2">
              {data.insights.insights.map((i) => (
                <li key={i} className="text-xs bg-[#DCEBE8]/40 border border-[#A9C1CC]/40 rounded-xl p-3">{i}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 lg:col-span-7">
              <CorrelationCard correlations={data.correlations} />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <EnvironmentCard />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 lg:col-span-7">
              <ReportPreview report={data.report} onExport={exportReport} exporting={exporting} />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <Appointments appointments={data.appointments} onCancel={cancelAppointment} />
            </div>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
