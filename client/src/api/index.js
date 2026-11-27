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
  toggleMedicine: (id) => request(`/medicines/${id}/toggle`, { method: 'POST' }),
  removeMedicine: (id) => request(`/medicines/${id}`, { method: 'DELETE' }),
  carePlan: () => request('/care-plan'),
  addCareStep: (step) => request('/care-plan', { method: 'POST', body: step }),
  updateCareStep: (id, patch) => request(`/care-plan/${id}`, { method: 'PATCH', body: patch }),
  doctors: () => request('/doctors'),
  appointments: () => request('/appointments'),
  book: ({ doctorId, slot, reportAttached }) =>
    request('/appointments', { method: 'POST', body: { doctorId, slot, reportAttached } }),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'POST' })
};

export const insightsApi = {
  dashboard: () => request('/analytics/dashboard'),
  correlations: (windowDays = 7) => request(`/analytics/correlations${toQuery({ windowDays })}`),
  insights: () => request('/analytics/insights'),
  trend: () => request('/analytics/trend'),
  weather: (lat, lon) => request(`/weather/current${toQuery({ lat, lon })}`),
  reportSummary: () => request('/reports/summary'),
  reportPdf: () => request('/reports/pdf')
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
