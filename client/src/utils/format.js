// Small presentation helpers shared across pages.

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(user) {
  return (user?.fullName || '').trim().split(/\s+/)[0] || 'there';
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || '?').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
}

export function shortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function percent(value, digits = 0) {
  return value === null || value === undefined ? '—' : `${Number(value).toFixed(digits)}%`;
}

export function signed(value, digits = 0) {
  if (value === null || value === undefined) return '—';
  const n = Number(value).toFixed(digits);
  return value > 0 ? `+${n}` : n;
}

/** Colour for a 0-100 severity score (lower is better). */
export function severityColor(score) {
  if (score >= 65) return '#B98CE8'; // marked reaction
  if (score >= 40) return '#F2C98A'; // active flare
  return '#3F5F4A'; // clearing
}

const GOOD = ['Improving', 'Significant Improvement'];
const BAD = ['Worsening', 'Elevated Risk', 'Mild Flare'];

/** 'good' | 'bad' | 'neutral' tone for a scan status. */
export function statusTone(status, condition) {
  if (GOOD.includes(status) || condition === 'normal') return 'good';
  if (BAD.includes(status)) return 'bad';
  return 'neutral';
}

export const TONE_BADGE = {
  good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  bad: 'bg-amber-50 text-amber-700 border-amber-200',
  neutral: 'bg-sky-50 text-sky-700 border-sky-200'
};

export function moodEmoji(score) {
  if (score >= 8) return '😊';
  if (score >= 6) return '🙂';
  if (score >= 4) return '😐';
  if (score >= 2) return '😟';
  return '😢';
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Parse a booking slot ("YYYY-MM-DDTHH:MM", clinic wall-clock time). Returns null for legacy free text. */
export function parseSlot(slot) {
  if (!slot || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(slot)) return null;
  return new Date(slot); // no zone suffix -> parsed as local time
}

export function slotTime(slot) {
  const d = parseSlot(slot);
  return d ? d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : slot;
}

export function slotDay(slot, { long = false } = {}) {
  const d = parseSlot(slot);
  if (!d) return slot;
  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: long ? 'long' : 'short', month: 'short', day: 'numeric' });
}

/** "Tomorrow · 2:30 PM" for structured slots; legacy text unchanged. */
export function formatSlot(slot) {
  return parseSlot(slot) ? `${slotDay(slot)} · ${slotTime(slot)}` : slot;
}

/** Date + time of a scan, e.g. "Nov 24, 9:41 AM". */
export function dateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** Whole days between an ISO timestamp and now (calendar-day based). */
export function daysSince(iso, now = new Date()) {
  if (!iso) return null;
  const d = new Date(iso);
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((b - a) / 86400000);
}

export function relativeDays(iso) {
  const n = daysSince(iso);
  if (n === null) return '';
  if (n <= 0) return 'today';
  if (n === 1) return 'yesterday';
  return `${n} days ago`;
}

/** Local YYYY-MM-DD for a Date (used for daily report links). */
export function isoDay(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}
