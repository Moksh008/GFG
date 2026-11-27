// The dashboard's next-step logic: which single action the patient should take now.
import { RESCAN_AFTER_DAYS } from './areas';
import { daysSince } from './format';

/**
 * Decide what the patient should do next. Ordered by priority — the first match wins.
 * Returns { kind, area?, scan?, ... }.
 */
export function journeyState({ areas, appointments }) {
  if (!areas.length) return { kind: 'first-scan' };
  const latestScan = areas[0].latest;
  const upcoming = appointments.find((a) => a.upcoming && a.status === 'confirmed');

  if (latestScan && daysSince(latestScan.createdAt) <= 1 && !latestScan.questionnaireAnswers) {
    return { kind: 'finish-checkin', area: areas[0], scan: latestScan };
  }
  const worse = areas.find(
    (a) => (a.vsPrevious && a.vsPrevious.severity >= 10) || ['soon', 'urgent'].includes(a.latest.consultation?.urgency)
  );
  if (worse && !upcoming) return { kind: 'attention', area: worse };

  const due = areas
    .map((a) => ({ area: a, days: daysSince(a.latest.createdAt) }))
    .filter((d) => d.days >= RESCAN_AFTER_DAYS)
    .sort((a, b) => b.days - a.days)[0];
  if (due) return { kind: 'rescan-due', area: due.area, days: due.days, upcoming };

  if (daysSince(latestScan.createdAt) === 0) return { kind: 'scanned-today', area: areas[0], upcoming };
  if (areas[0].scans.length === 1) return { kind: 'baseline', area: areas[0], upcoming };
  return { kind: 'on-track', area: areas[0], upcoming };
}
