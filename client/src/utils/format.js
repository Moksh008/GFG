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
