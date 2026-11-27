import React, { useMemo, useState } from 'react';
import { Camera, Plus } from 'lucide-react';
import { skinApi } from '../api';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState, ErrorBanner, Spinner } from '../components/ui/Feedback';
import { LineChart } from '../components/ui/LineChart';
import { buttonClass } from '../components/ui/classes';
import ScanModal from '../components/modals/ScanModal';
import CompareModal from '../components/modals/CompareModal';
import { ScanDetailModal } from '../components/scans/ScanDetailModal';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../hooks/useToast';
import { TONE_BADGE, severityColor, shortDate, statusTone } from '../utils/format';

function ScanTile({ scan, onOpen }) {
  return (
    <button type="button" onClick={() => onOpen(scan)} className="solid-card !p-0 overflow-hidden text-left hover:shadow-lg transition cursor-pointer">
      <div className="h-36 bg-slate-100">
        {scan.imageUrl && <img src={scan.imageUrl} alt={scan.bodyArea} className="w-full h-full object-cover" loading="lazy" />}
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold truncate">{scan.bodyArea}</span>
          <span className="text-xs font-bold" style={{ color: severityColor(scan.severityScore) }}>{scan.severityScore}</span>
        </div>
        <div className="text-[11px] text-[#8A9AA0] capitalize">{scan.condition} · {scan.date}</div>
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TONE_BADGE[statusTone(scan.status, scan.condition)]}`}>
          {scan.status}
        </span>
      </div>
    </button>
  );
}

export default function ScansPage() {
  const showToast = useToast();
  const [area, setArea] = useState('');
  const [selected, setSelected] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [comparison, setComparison] = useState(null);

  const history = useAsync(() => skinApi.history(), []);
  const progress = useAsync(() => skinApi.progress(area || undefined), [area]);

  const scans = useMemo(
    () => (history.data || []).filter((s) => !area || s.bodyArea.toLowerCase() === area.toLowerCase()),
    [history.data, area]
  );
  const bodyAreas = progress.data?.bodyAreas || [];
  const series = progress.data?.series || [];
  const overall = progress.data?.overall;

  const refresh = () => {
    history.reload();
    progress.reload();
  };

  const openCompare = async (scan) => {
    try {
      setComparison(await skinApi.compare(undefined, scan.id));
      setSelected(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AppShell
      title="Skin scans"
      subtitle="Every scan, measured and compared over time"
      aside={
        <button type="button" onClick={() => setScanOpen(true)} className={`${buttonClass.pill} !py-2`}>
          <Plus className="w-3.5 h-3.5" /> New scan
        </button>
      }
    >
      <ErrorBanner error={history.error} onRetry={refresh} />

      <div className="solid-card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm font-semibold">Severity over time</h3>
            <p className="text-[11px] text-[#8A9AA0]">
              {overall
                ? `${overall.improvementPct >= 0 ? 'Improved' : 'Worsened'} ${Math.abs(overall.improvementPct)}% since the first scan${area ? ' of this area' : ''}`
                : 'Scan the same area at least twice to measure change'}
            </p>
          </div>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white">
            <option value="">All body areas</option>
            {bodyAreas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        {series.length ? (
          <LineChart
            height={110}
            points={series.map((p) => ({ label: shortDate(p.date), value: p.severity, color: severityColor(p.severity) }))}
            formatValue={(v) => `${v}/100`}
          />
        ) : (
          <p className="text-[11px] text-[#8A9AA0] py-6 text-center">No data yet.</p>
        )}
      </div>

      {history.loading && !history.data ? (
        <Spinner className="text-white" />
      ) : scans.length === 0 ? (
        <div className="solid-card">
          <EmptyState
            icon={Camera}
            title="No scans yet"
            action={<button type="button" onClick={() => setScanOpen(true)} className={buttonClass.primary}>Take your first scan</button>}
          >
            Photograph an affected area to get an AI analysis and start tracking progress.
          </EmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {scans.map((s) => (
            <ScanTile key={s.id} scan={s} onOpen={setSelected} />
          ))}
        </div>
      )}

      <ScanModal
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
        defaultBodyArea={area || scans[0]?.bodyArea}
        onSaved={() => {
          showToast('Scan saved to your history.');
          refresh();
        }}
      />
      <ScanDetailModal
        key={selected?.id}
        scan={selected}
        onClose={() => setSelected(null)}
        onCompare={openCompare}
        onChanged={(updated) => {
          setSelected(updated);
          history.setData((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        }}
        onDeleted={() => {
          setSelected(null);
          showToast('Scan deleted.');
          refresh();
        }}
      />
      <CompareModal isOpen={Boolean(comparison)} onClose={() => setComparison(null)} comparison={comparison} />
    </AppShell>
  );
}
