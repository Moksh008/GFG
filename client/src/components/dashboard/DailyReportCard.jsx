import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Circle, FileDown, FileText, Loader2 } from 'lucide-react';
import { reportsApi } from '../../api';
import { useAsync } from '../../hooks/useAsync';

function Item({ done, label, detail }) {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <li className="flex items-center gap-2 text-[12px]">
      <Icon className={`w-4 h-4 shrink-0 ${done ? 'text-[#2FBF71]' : 'text-slate-300'}`} />
      <span className={`font-semibold ${done ? 'text-[#1F2A2E]' : 'text-[#8A9AA0]'}`}>{label}</span>
      <span className="ml-auto text-[11px] text-[#8A9AA0] font-medium truncate">{detail}</span>
    </li>
  );
}

/**
 * Today's end-of-day report status. `refreshKey` should change whenever scans, doses or
 * mood change so the checklist stays current.
 */
export function DailyReportCard({ refreshKey, onDownloadPdf, downloading }) {
  const navigate = useNavigate();
  const { data: r, loading } = useAsync(() => reportsApi.daily(), [refreshKey]);

  const meds = r?.medications;
  return (
    <div className="solid-card min-h-[280px] lg:h-[340px] flex flex-col">
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[#1F2A2E]">Today's Doctor Report</h3>
          <p className="text-[11px] text-[#8A9AA0] font-medium">
            {r ? new Date(`${r.date}T00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'End-of-day summary'}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#DCEBE8] text-[#0F3B3F] flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </div>
      </div>

      {!r ? (
        <div className="flex-1 flex items-center justify-center text-[11px] text-[#8A9AA0] gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} Preparing today's summary…
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 mt-2 min-h-0">
          <ul className="space-y-1.5">
            <Item
              done={r.scansToday.length > 0}
              label="Skin scan"
              detail={r.scansToday.length ? `${r.scansToday.length} area${r.scansToday.length > 1 ? 's' : ''} scanned` : 'Not yet'}
            />
            <Item
              done={meds.expected > 0 && meds.taken >= meds.expected}
              label="Medicine doses"
              detail={meds.expected ? `${meds.taken}/${meds.expected} taken` : 'No medicines'}
            />
            <Item done={r.mood.length > 0} label="Mood check-in" detail={r.mood.length ? `Mood ${r.mood[r.mood.length - 1].mood}/10` : 'Not yet'} />
          </ul>
          {r.flags.length > 0 ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[10px] text-amber-900 flex gap-1.5 min-h-0 overflow-hidden">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
              <span className="line-clamp-2">
                <strong>{r.flags.length} note{r.flags.length > 1 ? 's' : ''} for your doctor:</strong> {r.flags[0]}
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-[#647C7C] line-clamp-2">{r.summary}</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => navigate('/report/daily')}
          className="flex-1 h-8 rounded-full bg-[#0F3B3F] hover:bg-[#1F6A66] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" /> View report
        </button>
        <button
          type="button"
          onClick={() => onDownloadPdf(r?.date)}
          disabled={downloading}
          className="flex-1 h-8 rounded-full border border-slate-200 hover:bg-slate-50 text-[#0F3B3F] text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />} PDF
        </button>
      </div>
    </div>
  );
}
