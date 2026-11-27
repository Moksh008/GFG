// Core HTTP client: base URL, JWT storage, automatic token refresh, typed errors.

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const STORAGE_KEY = 'dermora.auth';
const listeners = new Set();

export class ApiError extends Error {
  constructor(status, detail) {
    super(typeof detail === 'string' ? detail : 'Request failed');
    this.status = status;
    this.detail = detail;
  }
}

// ---------------------------------------------------------------- session store
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function setSession(tokenResponse) {
  const session = {
    access: tokenResponse.access_token,
    refresh: tokenResponse.refresh_token,
    user: tokenResponse.user
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  listeners.forEach((fn) => fn(session));
  return session;
}

export function updateSessionUser(user) {
  const session = getSession();
  if (!session) return;
  session.user = user;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  listeners.forEach((fn) => fn(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((fn) => fn(null));
}

/** Subscribe to login/logout/refresh. Returns an unsubscribe function. */
export function onSessionChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---------------------------------------------------------------- requests
async function send(path, { method = 'GET', body, form, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  try {
    return await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, 'Cannot reach the Dermora server. Is the backend running?');
  }
}

function errorMessage(detail, fallback) {
  if (typeof detail === 'string') return detail;
  // FastAPI validation errors: [{ loc, msg }]
  if (Array.isArray(detail) && detail[0]?.msg) return detail.map((d) => d.msg).join('; ');
  return fallback;
}

async function parse(res) {
  if (res.status === 204) return null;
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : await res.blob();
  if (!res.ok) {
    const detail = isJson ? data?.detail : undefined;
    throw new ApiError(res.status, errorMessage(detail, res.statusText || 'Request failed'));
  }
  return data;
}

let refreshInFlight = null;

async function refreshSession() {
  const session = getSession();
  if (!session?.refresh) throw new ApiError(401, 'Not signed in');
  const res = await send('/auth/refresh', { method: 'POST', body: { refreshToken: session.refresh } });
  if (!res.ok) {
    clearSession();
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }
  return setSession(await res.json());
}

/** Public (unauthenticated) request. */
export async function publicRequest(path, opts) {
  return parse(await send(path, opts));
}

/** Authenticated request; transparently refreshes an expired access token once. */
export async function request(path, opts = {}) {
  const session = getSession();
  if (!session?.access) throw new ApiError(401, 'Not signed in');
  let res = await send(path, { ...opts, token: session.access });
  if (res.status === 401) {
    refreshInFlight = refreshInFlight || refreshSession().finally(() => (refreshInFlight = null));
    const fresh = await refreshInFlight;
    res = await send(path, { ...opts, token: fresh.access });
  }
  return parse(res);
}

/** Build a URL usable in <audio src> for endpoints that accept ?token=. */
export function withToken(url) {
  const token = getSession()?.access;
  if (!url || !token) return url;
  return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
}

export function toQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== null && v !== '' && q.append(k, v));
  const s = q.toString();
  return s ? `?${s}` : '';
}
