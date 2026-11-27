import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { ErrorBanner, Spinner } from '../components/ui/Feedback';
import { HeaderStats } from '../components/dashboard/HeaderStats';
import { SkinHealthTrendCard } from '../components/dashboard/SkinHealthTrendCard';
import { LesionChangeCard } from '../components/dashboard/LesionChangeCard';
import { MedicineAdherenceCard } from '../components/dashboard/MedicineAdherenceCard';
import { SuggestedStepsCard } from '../components/dashboard/SuggestedStepsCard';
import { HealthcareProvidersCard } from '../components/dashboard/HealthcareProvidersCard';
import { AriaCard } from '../components/dashboard/AriaCard';
import { MoodCheckInCard } from '../components/dashboard/MoodCheckInCard';
import { EnvironmentCard } from '../components/dashboard/EnvironmentCard';
import { SolaceCard } from '../components/dashboard/SolaceCard';
import ScanModal from '../components/modals/ScanModal';
import CompareModal from '../components/modals/CompareModal';
import BookModal from '../components/modals/BookModal';
import MedicineModal from '../components/modals/MedicineModal';
import PlanModal from '../components/modals/PlanModal';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { useReportExport } from '../hooks/useReportExport';
import { firstName, greeting } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const data = useDashboardData();
  const { actions } = data;
  const { exportReport } = useReportExport();

  // Which modal is open: 'scan' | 'compare' | 'meds' | 'plan' | 'book' | null
  const [modal, setModal] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const open = (name) => () => setModal(name);
  const close = () => setModal(null);

  const medsTaken = data.medicines.filter((m) => m.takenToday).length;
  const latestArea = data.scans[0]?.bodyArea;

  return (
    <AppShell
      title={greeting()}
      subtitle={`${firstName(user)} · here's your skin and wellbeing update for today`}
      aside={
        <HeaderStats
          scansCount={data.scans.length}
          medsTaken={medsTaken}
          medsTotal={data.medicines.length}
          upcomingAppointments={data.appointments.length}
        />
      }
    >
      <ErrorBanner error={data.error} onRetry={data.reload} />
      {data.loading && !data.summary ? (
        <Spinner label="Loading your dashboard…" className="py-24 text-white" />
      ) : (
        <>
          {/* Row 1: skin trend | lesion change | adherence */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 lg:col-span-5">
              <SkinHealthTrendCard scans={data.scans} onOpenScanModal={open('scan')} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <LesionChangeCard scans={data.scans} comparison={data.comparison} onOpenCompare={open('compare')} />
            </div>
            <div className="col-span-12 lg:col-span-3">
              <MedicineAdherenceCard medicines={data.medicines} adherence7d={data.adherence7d} onOpenMeds={open('meds')} />
            </div>
          </div>

          {/* Row 2: care plan | providers | Aria */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 lg:col-span-4">
              <SuggestedStepsCard careSteps={data.careSteps} onOpenPlanModal={open('plan')} onToggleStep={actions.toggleCareStep} />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <HealthcareProvidersCard
                doctors={data.doctors}
                onSelectDoctor={(doc) => {
                  setSelectedDoctor(doc);
                  setModal('book');
                }}
              />
            </div>
            <div className="col-span-12 lg:col-span-3">
              <AriaCard scanCount={data.scans.length} onExportReport={exportReport} onOpenScan={open('scan')} />
            </div>
          </div>

          {/* Row 3: mood | environment | Solace */}
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

      <ScanModal isOpen={modal === 'scan'} onClose={close} onSaved={actions.scanSaved} defaultBodyArea={latestArea} />
      <CompareModal isOpen={modal === 'compare'} onClose={close} comparison={data.comparison} />
      <BookModal isOpen={modal === 'book'} onClose={close} doctor={selectedDoctor} onConfirm={actions.bookAppointment} />
      <MedicineModal
        isOpen={modal === 'meds'}
        onClose={close}
        medicines={data.medicines}
        onToggleMed={actions.toggleMedicine}
        onAddMed={actions.addMedicine}
      />
      <PlanModal isOpen={modal === 'plan'} onClose={close} onAddPlan={actions.addCareStep} />
    </AppShell>
  );
}
