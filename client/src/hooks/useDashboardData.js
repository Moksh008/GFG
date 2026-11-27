import { useCallback } from 'react';
import { careApi, insightsApi, moodApi, skinApi } from '../api';
import { useAsync } from './useAsync';
import { useToast } from './useToast';

const EMPTY = {
  summary: null,
  scans: [],
  comparison: null,
  medicines: [],
  adherence7d: null,
  doctors: [],
  careSteps: [],
  appointments: []
};

async function loadDashboard() {
  const [summary, scans, meds, doctors, careSteps, appointments, comparison] = await Promise.all([
    insightsApi.dashboard(),
    skinApi.history(),
    careApi.medicines(),
    careApi.doctors(),
    careApi.carePlan(),
    careApi.appointments(),
    skinApi.compare().catch(() => null) // 404 until two scans of one area exist
  ]);
  return {
    summary,
    scans,
    comparison,
    medicines: meds.medicines,
    adherence7d: meds.adherence7d,
    doctors,
    careSteps,
    appointments: appointments.filter((a) => a.status === 'confirmed')
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
        return result;
      } catch (err) {
        showToast(err.message, 'error');
        return null;
      }
    },
    [showToast]
  );

  // The scan is already persisted by the ScanModal; refresh derived stats/comparison.
  const scanSaved = useCallback(async () => {
    showToast('New skin scan analysed and saved to your history.');
    await reload();
  }, [reload, showToast]);

  const toggleMedicine = useCallback(
    async (id) => {
      const updated = await mutate(() => careApi.toggleMedicine(id));
      if (updated) patch((d) => ({ medicines: d.medicines.map((m) => (m.id === id ? updated : m)) }));
    },
    [mutate, patch]
  );

  const addMedicine = useCallback(
    async (med) => {
      const created = await mutate(() => careApi.addMedicine(med), (m) => `Added ${m.name} to your regimen.`);
      if (created) patch((d) => ({ medicines: [...d.medicines, created] }));
    },
    [mutate, patch]
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

  const bookAppointment = useCallback(
    async (booking) => {
      const created = await mutate(() => careApi.book(booking), (a) => `Appointment confirmed with ${a.doctor}.`);
      if (created) patch((d) => ({ appointments: [created, ...d.appointments] }));
      return created;
    },
    [mutate, patch]
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

  return {
    ...state,
    loading,
    error,
    reload,
    actions: { scanSaved, toggleMedicine, addMedicine, addCareStep, toggleCareStep, bookAppointment, logMood }
  };
}
