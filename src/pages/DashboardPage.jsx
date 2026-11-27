import React, { useState } from 'react';
import { Header } from '../components/Header';
import { SkinHealthTrendCard } from '../components/SkinHealthTrendCard';
import { LesionChangeCard } from '../components/LesionChangeCard';
import { MedicineAdherenceCard } from '../components/MedicineAdherenceCard';
import { SuggestedStepsCard } from '../components/SuggestedStepsCard';
import { HealthcareProvidersCard } from '../components/HealthcareProvidersCard';
import { AriaCard } from '../components/AriaCard';
import ScanModal from '../components/ScanModal';
import CompareModal from '../components/CompareModal';
import BookModal from '../components/BookModal';
import MedicineModal from '../components/MedicineModal';
import PlanModal from '../components/PlanModal';
import { generateDoctorReport } from '../utils/pdfExport';
import {
  initialDoctors,
  initialMedicines,
  initialScans,
  initialCareSteps,
  initialAppointments
} from '../data/mockData';
import { CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const [scans, setScans] = useState(initialScans);
  const [medicines, setMedicines] = useState(initialMedicines);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [careSteps, setCareSteps] = useState(initialCareSteps);
  const [appointments, setAppointments] = useState(initialAppointments);

  // Modals state
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isMedOpen, setIsMedOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveScan = (newScan) => {
    setScans([newScan, ...scans]);
    showToast('New dermoscopy scan analyzed and registered.');
  };

  const handleToggleMed = (id) => {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, takenToday: !m.takenToday } : m))
    );
  };

  const handleAddMed = (newMed) => {
    setMedicines([...medicines, newMed]);
    showToast(`Added ${newMed.name} to medication regimen.`);
  };

  const handleAddPlan = (newPlan) => {
    setCareSteps([newPlan, ...careSteps]);
    showToast('Added new custom step to care plan.');
  };

  const handleConfirmBooking = (apt) => {
    setAppointments([apt, ...appointments]);
    showToast(`Appointment confirmed with ${apt.doctor}.`);
  };

  const handleExportPDF = () => {
    generateDoctorReport({
      patientName: 'Alex Mercer',
      scans,
      medicines,
      doctor: doctors[0].name
    });
    showToast('Doctor-ready PDF generated and downloaded.');
  };

  const medsTakenCount = medicines.filter((m) => m.takenToday).length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#6F8FA3] via-[#A9C1CC] to-[#DCEBE8] text-[#1F2A2E] antialiased">
      <div className="max-w-[1440px] mx-auto px-6 pb-8">
        {/* Header with solid controls and active route */}
        <Header
          scansCount={1360 + scans.length - 3}
          medsTaken={2654 + medsTakenCount}
          upcomingApts={54 + appointments.length - 1}
        />

        {/* 12-Column Grid */}
        <main className="space-y-2.5 mt-2">
          {/* Row 1: 5 cols (Skin Health) | 4 cols (Lesion Delta) | 3 cols (Adherence) */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 lg:col-span-5">
              <SkinHealthTrendCard
                scans={scans}
                onOpenScanModal={() => setIsScanOpen(true)}
              />
            </div>

            <div className="col-span-12 lg:col-span-4">
              <LesionChangeCard onOpenCompare={() => setIsCompareOpen(true)} />
            </div>

            <div className="col-span-12 lg:col-span-3">
              <MedicineAdherenceCard
                medicines={medicines}
                onOpenMeds={() => setIsMedOpen(true)}
              />
            </div>
          </div>

          {/* Row 2: 4 cols (Suggested Steps) | 5 cols (Healthcare Providers) | 3 cols (Aria Assistant) */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 lg:col-span-4">
              <SuggestedStepsCard
                careSteps={careSteps}
                onOpenPlanModal={() => setIsPlanOpen(true)}
              />
            </div>

            <div className="col-span-12 lg:col-span-5">
              <HealthcareProvidersCard
                doctors={doctors}
                onSelectDoctor={(doc) => {
                  setSelectedDoctor(doc);
                  setIsBookOpen(true);
                }}
              />
            </div>

            <div className="col-span-12 lg:col-span-3">
              <AriaCard
                onExportReport={handleExportPDF}
                scans={scans}
                medicines={medicines}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F3B3F] text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom duration-200 border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-[#2FBF71]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onSaveScan={handleSaveScan}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        scans={scans}
      />

      <BookModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        doctor={selectedDoctor}
        onConfirm={handleConfirmBooking}
      />

      <MedicineModal
        isOpen={isMedOpen}
        onClose={() => setIsMedOpen(false)}
        medicines={medicines}
        onToggleMed={handleToggleMed}
        onAddMed={handleAddMed}
      />

      <PlanModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        onAddPlan={handleAddPlan}
      />
    </div>
  );
}
