// Which department fits the patient's latest findings. Departments match the provider directory.

const BY_CONDITION = {
  eczema: 'Eczema & Psoriasis',
  psoriasis: 'Eczema & Psoriasis',
  vitiligo: 'Pigmentation & Vitiligo'
};

/**
 * @param latest   newest scan (or undefined)
 * @param stress   average stress 1-10 (or null)
 * @returns { department, reason } | null
 */
export function recommendSpecialty(latest, stress) {
  if (!latest) return null;
  if (latest.severityScore >= 65 || latest.borderRegularityScore < 60) {
    return { department: 'Dermatopathology', reason: 'High severity or irregular borders are best reviewed by a lesion specialist.' };
  }
  if (stress != null && stress >= 7) {
    return { department: 'Psychodermatology', reason: 'Your stress is high — a psychodermatologist treats stress-linked flares.' };
  }
  const dept = BY_CONDITION[latest.condition];
  if (dept) return { department: dept, reason: `Specialists for ${latest.conditionDisplay || latest.condition}.` };
  return { department: 'General Dermatology', reason: 'A general dermatologist can review your scans.' };
}
