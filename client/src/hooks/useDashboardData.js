import { useCallback } from 'react';
import { careApi, demoApi, insightsApi, moodApi, skinApi } from '../api';
import { useAsync } from './useAsync';
import { useToast } from './useToast';

const EMPTY = {
  summary: null,
  scans: [],
  medicines: [],
  adherence7d: null,
  doseHistory: [],
  doctors: [],
  careSteps: [],
  appointments: []
};

async function loadDashboard() {
  const [summary, scans, meds, history, doctors, careSteps, appointments] = await Promise.all([
    insightsApi.dashboard(),
    skinApi.history(),
    careApi.medicines(),
    careApi.medicineHistory(14).catch(() => ({ days: [] })),
    careApi.doctors(),
    careApi.carePlan(),
    careApi.appointments()
  ]);
  return {
    summary,
    scans,
    medicines: meds.medicines,
    adherence7d: meds.adherence7d,
    doseHistory: history.days,
    doctors,
    careSteps,
    appointments
  };
}

/** All dashboard state plus mutations that keep it in sync with the API. */
export function useDashboardData() {
  const showToast = useToast();
  const { data, error, loading, reload, setData } = useAsync(loadDashboard, []);
  const state = data || EMPTY;

  const patch = useCallback((fn) => setData((d) => ({ ...(d || EMPTY), ...fn(d || EMPTY) })), [setData]);

  /** Wrap a mutation: run it, toast on success, toast the error on failure. */
  const mutate = useCallback(
    async (action, successMessage) => {
      try {
        const result = await action();
        if (successMessage) showToast(typeof successMessage === 'function' ? successMessage(result) : successMessage);
        return result ?? true;
      } catch (err) {
        showToast(err.message, 'error');
        return null;
      }
    },
    [showToast]
  );

  /** Dose changes move today's adherence numbers, so refresh the history + weekly figure too. */
  const refreshAdherence = useCallback(async () => {
    const [meds, history] = await Promise.all([careApi.medicines(), careApi.medicineHistory(14)]).catch(() => [null, null]);
    if (meds && history) patch(() => ({ medicines: meds.medicines, adherence7d: meds.adherence7d, doseHistory: history.days }));
  }, [patch]);

  // The scan is already persisted by the ScanModal; refresh derived stats/comparison.
  const scanSaved = useCallback(async () => {
    showToast('New skin scan analysed and saved to your history.');
    await reload();
  }, [reload, showToast]);

  const toggleMedicine = useCallback(
    async (id) => {
      const updated = await mutate(() => careApi.toggleMedicine(id));
      if (updated) {
        patch((d) => ({ medicines: d.medicines.map((m) => (m.id === id ? updated : m)) }));
        refreshAdherence();
      }
    },
    [mutate, patch, refreshAdherence]
  );

  const setDoses = useCallback(
    async (id, taken) => {
      const updated = await mutate(() => careApi.setDoses(id, taken));
      if (updated) {
        patch((d) => ({ medicines: d.medicines.map((m) => (m.id === id ? updated : m)) }));
        refreshAdherence();
      }
    },
    [mutate, patch, refreshAdherence]
  );

  const addMedicine = useCallback(
    async (med) => {
      const created = await mutate(() => careApi.addMedicine(med), (m) => `Added ${m.name} to your regimen.`);
      if (created) {
        patch((d) => ({ medicines: [...d.medicines, created] }));
        refreshAdherence();
      }
      return created;
    },
    [mutate, patch, refreshAdherence]
  );

  const removeMedicine = useCallback(
    async (med) => {
      const ok = await mutate(() => careApi.removeMedicine(med.id), `Removed ${med.name}.`);
      if (ok) {
        patch((d) => ({ medicines: d.medicines.filter((m) => m.id !== med.id) }));
        refreshAdherence();
      }
    },
    [mutate, patch, refreshAdherence]
  );

  const addCareStep = useCallback(
    async (step) => {
      const created = await mutate(() => careApi.addCareStep(step), 'Added a new step to your care plan.');
      if (created) patch((d) => ({ careSteps: [created, ...d.careSteps] }));
    },
    [mutate, patch]
  );

  const toggleCareStep = useCallback(
    async (step) => {
      const updated = await mutate(() => careApi.updateCareStep(step.id, { completed: !step.completed }));
      if (updated) patch((d) => ({ careSteps: d.careSteps.map((s) => (s.id === step.id ? updated : s)) }));
    },
    [mutate, patch]
  );

  /** Booking changes the doctor's open slots, so re-fetch providers and appointments. */
  const refreshBookings = useCallback(async () => {
    const [doctors, appointments] = await Promise.all([careApi.doctors(), careApi.appointments()]).catch(() => [null, null]);
    if (doctors && appointments) patch(() => ({ doctors, appointments }));
  }, [patch]);

  const bookAppointment = useCallback(
    async (booking) => {
      const created = await mutate(() => careApi.book(booking), (a) => `Appointment confirmed with ${a.doctor}.`);
      if (created) await refreshBookings();
      return created;
    },
    [mutate, refreshBookings]
  );

  const cancelAppointment = useCallback(
    async (apt) => {
      const updated = await mutate(() => careApi.cancelAppointment(apt.id), `Cancelled your visit with ${apt.doctor}.`);
      if (updated) await refreshBookings();
    },
    [mutate, refreshBookings]
  );

  const logMood = useCallback(
    async (entry) => {
      const created = await mutate(() => moodApi.log(entry), 'Mood check-in saved.');
      if (created) {
        const summary = await insightsApi.dashboard().catch(() => null);
        if (summary) patch(() => ({ summary }));
      }
      return created;
    },
    [mutate, patch]
  );

  const fillDemoData = useCallback(async () => {
    const ok = await mutate(() => demoApi.fill(), 'Demo data loaded — a month of scans, doses, mood and visits.');
    if (ok) await reload();
  }, [mutate, reload]);

  const resetData = useCallback(async () => {
    const ok = await mutate(() => demoApi.reset(), 'Your health data was cleared.');
    if (ok) await reload();
  }, [mutate, reload]);

  return {
    ...state,
    loading,
    error,
    reload,
    actions: {
      scanSaved,
      toggleMedicine,
      setDoses,
      addMedicine,
      removeMedicine,
      addCareStep,
      toggleCareStep,
      bookAppointment,
      cancelAppointment,
      logMood,
      fillDemoData,
      resetData
    }
  };
}
