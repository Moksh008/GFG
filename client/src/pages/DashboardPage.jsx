import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import { skinApi } from '../api';
import { AppShell } from '../components/layout/AppShell';
import { ErrorBanner, Spinner } from '../components/ui/Feedback';
import { HeaderStats } from '../components/dashboard/HeaderStats';
import { ScanJourneyCard } from '../components/dashboard/ScanJourneyCard';
import { AreaTrackerCard } from '../components/dashboard/AreaTrackerCard';
import { SkinHealthTrendCard } from '../components/dashboard/SkinHealthTrendCard';
import { MedicineAdherenceCard } from '../components/dashboard/MedicineAdherenceCard';
import { AppointmentsCard } from '../components/dashboard/AppointmentsCard';
import { SuggestedStepsCard } from '../components/dashboard/SuggestedStepsCard';
import { DailyReportCard } from '../components/dashboard/DailyReportCard';
import { AriaCard } from '../components/dashboard/AriaCard';
import { MoodCheckInCard } from '../components/dashboard/MoodCheckInCard';
import { EnvironmentCard } from '../components/dashboard/EnvironmentCard';
import { SolaceCard } from '../components/dashboard/SolaceCard';
import ScanModal from '../components/modals/ScanModal';
import CompareModal from '../components/modals/CompareModal';
import BookModal from '../components/modals/BookModal';
import MedicineModal from '../components/modals/MedicineModal';
import PlanModal from '../components/modals/PlanModal';
import { ScanDetailModal } from '../components/scans/ScanDetailModal';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { useReportExport } from '../hooks/useReportExport';
import { useToast } from '../hooks/useToast';
import { groupByArea } from '../utils/areas';
import { journeyState } from '../utils/journey';
import { recommendSpecialty } from '../utils/specialty';
import { firstName, greeting } from '../utils/format';

/** "Sample data" menu: the app has no mock data until the user asks for it. */
function DataMenu({ hasData, busy, onFill, onReset }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const close = () => {
    setOpen(false);
    setConfirm(false);
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-[46px] w-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#1F2A2E] hover:bg-slate-50 cursor-pointer"
        aria-label="Data options"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-30 text-[#1F2A2E]">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8A9AA0]">Sample data</div>
          <button
            type="button"
            disabled={hasData || busy}
            onClick={() => {
              close();
              onFill();
            }}
            className="w-full flex items-start gap-2 px-2 py-2 text-xs rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-left"
          >
            <Database className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              <span className="font-semibold block">Fill demo data</span>
              <span className="text-[10px] text-[#8A9AA0]">{hasData ? 'Reset your data first' : 'A month of scans, doses, mood & visits'}</span>
            </span>
          </button>
          {confirm ? (
            <div className="px-2 py-2 rounded-lg bg-red-50 text-[11px] text-red-800">
              Delete all scans, medicines, mood logs, care plan and appointments?
              <div className="flex justify-end gap-3 mt-1.5">
                <button type="button" onClick={() => setConfirm(false)} className="font-semibold text-slate-600 cursor-pointer">Cancel</button>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onReset();
                  }}
                  className="font-bold text-red-700 cursor-pointer"
                >
                  Delete everything
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={!hasData || busy}
              onClick={() => setConfirm(true)}
              className="w-full flex items-start gap-2 px-2 py-2 text-xs rounded-lg hover:bg-red-50 text-red-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <Trash2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold block">Reset my data</span>
                <span className="text-[10px] opacity-75">Start again from an empty dashboard</span>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const data = useDashboardData();
  const { actions } = data;
  const { exportReport, exportDailyReport, exporting } = useReportExport();

  // Which modal is open: 'scan' | 'compare' | 'meds' | 'plan' | 'book' | null
  const [modal, setModal] = useState(null);
  const [scanArea, setScanArea] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [detailScan, setDetailScan] = useState(null);
  const [demoBusy, setDemoBusy] = useState(false);
  const close = () => setModal(null);

  const areas = useMemo(() => groupByArea(data.scans), [data.scans]);
  const state = journeyState({ areas, appointments: data.appointments });
  const recommendation = recommendSpecialty(data.scans[0], data.summary?.mood?.averageStress);
  const medsTaken = data.medicines.filter((m) => m.takenToday).length;
  const upcoming = data.appointments.filter((a) => a.upcoming && a.status === 'confirmed');
  const hasData =
    data.scans.length > 0 || data.medicines.length > 0 || data.appointments.length > 0 || data.summary?.mood?.average != null;
  // Changes whenever something the daily report depends on changes.
  const reportKey = `${data.scans.length}:${data.scans[0]?.id}:${data.medicines.map((m) => m.takenDoses).join(',')}:${
    data.summary?.mood?.latest
  }:${data.summary?.mood?.streakDays}`;

  const openScan = (area) => {
    setScanArea(area || null);
    setModal('scan');
  };

  const openCompare = async (baseline, current) => {
    try {
      setComparison(await skinApi.compare(baseline?.id, current?.id));
      setModal('compare');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  /** "Book a specialist" from the journey widget: pick the best available doctor in the recommended department. */
  const bookRecommended = () => {
    const pool = data.doctors.filter((d) => d.status === 'Available' && d.slots.length);
    const doc = pool.find((d) => d.department === recommendation?.department) || pool[0];
    if (!doc) return showToast('No specialists have open slots right now.', 'error');
    setSelectedDoctor(doc);
    setModal('book');
  };

  const runDemo = (fn) => async () => {
    setDemoBusy(true);
    await fn();
    setDemoBusy(false);
  };

  const bookReason =
    state.kind === 'attention' && state.area ? `${state.area.name}: worsening since last scan` : data.scans[0] ? `Review of ${data.scans[0].bodyArea}` : '';

  return (
    <AppShell
      title={greeting()}
      subtitle={`${firstName(user)} · here's your skin and wellbeing update for today`}
      aside={
        <div className="flex items-stretch gap-2">
          <div className="flex-1">
            <HeaderStats
              scansCount={data.scans.length}
              medsTaken={medsTaken}
              medsTotal={data.medicines.length}
              upcomingAppointments={upcoming.length}
            />
          </div>
          <DataMenu hasData={hasData} busy={demoBusy} onFill={runDemo(actions.fillDemoData)} onReset={runDemo(actions.resetData)} />
        </div>
      }
    >
      <ErrorBanner error={data.error} onRetry={data.reload} />
      {data.loading && !data.summary ? (
        <Spinner label="Loading your dashboard…" className="py-24 text-white" />
      ) : (
        <>
          <ScanJourneyCard
            state={state}
            areas={areas}
            scanCount={data.scans.length}
            onScan={openScan}
            onOpenScan={setDetailScan}
            onBook={bookRecommended}
            onOpenReport={() => navigate('/report/daily')}
            onFillDemo={runDemo(actions.fillDemoData)}
            demoBusy={demoBusy}
          />

          {/* Row 1: area tracking | medicines */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 xl:col-span-8">
              <AreaTrackerCard areas={areas} onScan={openScan} onOpenScan={setDetailScan} onCompare={openCompare} />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <MedicineAdherenceCard
                medicines={data.medicines}
                adherence7d={data.adherence7d}
                doseHistory={data.doseHistory}
                onOpenMeds={() => setModal('meds')}
              />
            </div>
          </div>

          {/* Row 2: overall trend | appointments */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 lg:col-span-5">
              <SkinHealthTrendCard scans={data.scans} onOpenScanModal={() => openScan()} />
            </div>
            <div className="col-span-12 lg:col-span-7">
              <AppointmentsCard
                doctors={data.doctors}
                appointments={data.appointments}
                recommendation={data.scans.length ? recommendation : null}
                onBook={(doc) => {
                  setSelectedDoctor(doc);
                  setModal('book');
                }}
                onCancel={actions.cancelAppointment}
              />
            </div>
          </div>

          {/* Row 3: care plan | daily doctor report | Aria */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <SuggestedStepsCard careSteps={data.careSteps} onOpenPlanModal={() => setModal('plan')} onToggleStep={actions.toggleCareStep} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <DailyReportCard refreshKey={reportKey} onDownloadPdf={exportDailyReport} downloading={exporting} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <AriaCard scanCount={data.scans.length} onExportReport={exportReport} onOpenScan={() => openScan()} />
            </div>
          </div>

          {/* Row 4: mood | environment | Solace */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <MoodCheckInCard moodSummary={data.summary?.mood} onLogMood={actions.logMood} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <EnvironmentCard />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <SolaceCard />
            </div>
          </div>
        </>
      )}

      <ScanModal
        isOpen={modal === 'scan'}
        onClose={close}
        onSaved={actions.scanSaved}
        defaultBodyArea={scanArea ?? undefined}
        knownAreas={areas.map((a) => a.name)}
      />
      <CompareModal isOpen={modal === 'compare'} onClose={close} comparison={comparison} />
      <BookModal isOpen={modal === 'book'} onClose={close} doctor={selectedDoctor} onConfirm={actions.bookAppointment} defaultReason={bookReason} />
      <MedicineModal
        isOpen={modal === 'meds'}
        onClose={close}
        medicines={data.medicines}
        onSetDoses={actions.setDoses}
        onAddMed={actions.addMedicine}
        onRemoveMed={actions.removeMedicine}
        areaSuggestions={areas.map((a) => a.name)}
      />
      <PlanModal isOpen={modal === 'plan'} onClose={close} onAddPlan={actions.addCareStep} />
      {detailScan && (
        <ScanDetailModal
          scan={detailScan}
          onClose={() => setDetailScan(null)}
          onChanged={(updated) => {
            setDetailScan(updated);
            data.reload();
          }}
          onDeleted={() => {
            setDetailScan(null);
            data.reload();
          }}
          onCompare={(scan) => {
            setDetailScan(null);
            openCompare(undefined, scan);
          }}
        />
      )}
    </AppShell>
  );
}
