// Domain-grouped API surface. Import as: import { skinApi, moodApi } from '../api';
import { publicRequest, request, setSession, toQuery } from './http';

export { ApiError, API_URL, clearSession, getSession, onSessionChange, withToken } from './http';

export const DEMO_CREDENTIALS = {
  email: import.meta.env.VITE_DEMO_EMAIL || 'alex@dermora.ai',
  password: import.meta.env.VITE_DEMO_PASSWORD || 'dermora-demo'
};

export const authApi = {
  login: async (email, password) => setSession(await publicRequest('/auth/login', { method: 'POST', body: { email, password } })),
  register: async ({ email, password, fullName }) =>
    setSession(await publicRequest('/auth/register', { method: 'POST', body: { email, password, fullName } })),
  me: () => request('/auth/me'),
  updateProfile: (patch) => request('/auth/me', { method: 'PATCH', body: patch }),
  deleteAccount: () => request('/auth/me', { method: 'DELETE' })
};

export const skinApi = {
  history: (bodyArea) => request(`/skin/history${toQuery({ bodyArea })}`),
  get: (id) => request(`/skin/diagnosis/${id}`),
  detect: ({ file, bodyArea, notes }) => {
    const form = new FormData();
    form.append('image', file);
    form.append('bodyArea', bodyArea);
    form.append('notes', notes);
    return request('/skin/detect', { method: 'POST', form });
  },
  remove: (id) => request(`/skin/diagnosis/${id}`, { method: 'DELETE' }),
  submitQuestionnaire: (id, answers) =>
    request(`/skin/diagnosis/${id}/questionnaire`, { method: 'POST', body: { answers } }),
  compare: (baselineId, currentId) => request(`/skin/compare${toQuery({ baselineId, currentId })}`),
  progress: (bodyArea) => request(`/skin/progress${toQuery({ bodyArea })}`)
};

export const moodApi = {
  log: (entry) => request('/mood/log', { method: 'POST', body: entry }),
  history: (days = 30) => request(`/mood/history${toQuery({ days })}`),
  patterns: (days = 30) => request(`/mood/patterns${toQuery({ days })}`),
  remove: (id) => request(`/mood/log/${id}`, { method: 'DELETE' })
};

export const careApi = {
  medicines: () => request('/medicines'),
  addMedicine: (med) => request('/medicines', { method: 'POST', body: med }),
  medicineHistory: (days = 14) => request(`/medicines/history${toQuery({ days })}`),
  toggleMedicine: (id) => request(`/medicines/${id}/toggle`, { method: 'POST' }),
  setDoses: (id, takenDoses) => request(`/medicines/${id}/doses`, { method: 'PUT', body: { takenDoses } }),
  updateMedicine: (id, patch) => request(`/medicines/${id}`, { method: 'PATCH', body: patch }),
  removeMedicine: (id) => request(`/medicines/${id}`, { method: 'DELETE' }),
  carePlan: () => request('/care-plan'),
  addCareStep: (step) => request('/care-plan', { method: 'POST', body: step }),
  updateCareStep: (id, patch) => request(`/care-plan/${id}`, { method: 'PATCH', body: patch }),
  doctors: (specialty) => request(`/doctors${toQuery({ specialty })}`),
  appointments: () => request('/appointments'),
  book: ({ doctorId, slot, reportAttached, type, notes }) =>
    request('/appointments', { method: 'POST', body: { doctorId, slot, reportAttached, type, notes } }),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'POST' })
};

export const insightsApi = {
  dashboard: () => request('/analytics/dashboard'),
  correlations: (windowDays = 7) => request(`/analytics/correlations${toQuery({ windowDays })}`),
  insights: () => request('/analytics/insights'),
  trend: () => request('/analytics/trend'),
  weather: (lat, lon) => request(`/weather/current${toQuery({ lat, lon })}`)
};

export const reportsApi = {
  summary: () => request('/reports/summary'),
  pdf: () => request('/reports/pdf'),
  // End-of-day report for the doctor; `date` is YYYY-MM-DD (UTC), defaults to today.
  daily: (date) => request(`/reports/daily${toQuery({ date })}`),
  dailyPdf: (date) => request(`/reports/daily/pdf${toQuery({ date })}`),
  issued: () => request('/reports/issued'),
  // Public — no sign-in needed, so doctors can verify a report they were given.
  verifyHash: (sha256) => publicRequest(`/reports/verify${toQuery({ hash: sha256 })}`),
  verifyId: (reportId) => publicRequest(`/reports/verify/${encodeURIComponent(reportId)}`)
};

// The app ships without mock data; these let a user opt in to (or wipe) a month of sample history.
export const demoApi = {
  status: () => request('/demo/status'),
  fill: () => request('/demo/seed', { method: 'POST' }),
  reset: () => request('/demo/data', { method: 'DELETE' })
};

export const chatApi = {
  history: () => request('/chat/history'),
  send: (message) => request('/chat', { method: 'POST', body: { message } }),
  clear: () => request('/chat/history', { method: 'DELETE' })
};

export const solaceApi = {
  start: (speak = true) => request(`/voice/start-session${toQuery({ speak })}`, { method: 'POST' }),
  sendText: (sessionId, text, speak = true) =>
    request(`/voice/session/${sessionId}/message`, { method: 'POST', body: { text, speak } }),
  sendAudio: (sessionId, blob, speak = true) => {
    const form = new FormData();
    form.append('sessionId', sessionId);
    form.append('speak', speak);
    const ext = (blob.type.split('/')[1] || 'webm').split(';')[0];
    form.append('audio', blob, `clip.${ext}`);
    return request('/voice/process-audio', { method: 'POST', form });
  },
  end: (sessionId) => request(`/voice/session/${sessionId}/end`, { method: 'POST' }),
  get: (sessionId) => request(`/voice/session/${sessionId}`),
  sessions: () => request('/voice/sessions')
};
