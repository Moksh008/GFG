// Group scans by body area so each tracked lesion has its own timeline and deltas.

/** Body areas are compared case/space-insensitively (matches the backend). */
export const normArea = (area = '') => area.toLowerCase().split(/\s+/).filter(Boolean).join(' ');

/** Days after which a tracked area is considered due for a follow-up scan. */
export const RESCAN_AFTER_DAYS = 7;

function delta(cur, ref) {
  if (!cur || !ref) return null;
  return {
    severity: cur.severityScore - ref.severityScore,
    redness: cur.rednessIndex - ref.rednessIndex,
    areaCm2: +(cur.areaCm2 - ref.areaCm2).toFixed(2),
    areaPct: ref.areaCm2 ? +(((cur.areaCm2 - ref.areaCm2) / ref.areaCm2) * 100).toFixed(1) : null,
    border: cur.borderRegularityScore - ref.borderRegularityScore,
    symmetry: cur.symmetryScore - ref.symmetryScore,
    days: Math.round((new Date(cur.createdAt) - new Date(ref.createdAt)) / 86400000)
  };
}

/**
 * scans (newest first, as returned by /skin/history) ->
 * [{ key, name, scans (oldest->newest), latest, previous, baseline, vsPrevious, vsBaseline }], most recently scanned first.
 */
export function groupByArea(scans) {
  const map = new Map();
  for (const s of scans) {
    const key = normArea(s.bodyArea);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return [...map.entries()].map(([key, list]) => {
    const series = [...list].reverse();
    const latest = series[series.length - 1];
    const previous = series.length > 1 ? series[series.length - 2] : null;
    const baseline = series.length > 1 ? series[0] : null;
    return {
      key,
      name: latest.bodyArea,
      scans: series,
      latest,
      previous,
      baseline,
      vsPrevious: delta(latest, previous),
      vsBaseline: delta(latest, baseline)
    };
  });
}
