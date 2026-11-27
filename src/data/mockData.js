// Initial clinical mock database for DermaTrack

export const initialDoctors = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins, MD',
    title: 'Board Certified Dermatologist',
    specialty: 'Clinical Dermatology & Oncology',
    department: 'Cutaneous Medicine',
    contact: '+1 (555) 349-8201',
    email: 's.jenkins@dermamed.org',
    rating: 4.9,
    reviews: 128,
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    slots: ['Today, 2:30 PM', 'Tomorrow, 10:15 AM', 'Friday, 4:00 PM']
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Vance, DO',
    title: 'Dermatopathologist',
    specialty: 'Melanoma & Lesion Diagnostics',
    department: 'Pathology & Biopsy',
    contact: '+1 (555) 782-9912',
    email: 'm.vance@dermapath.io',
    rating: 4.8,
    reviews: 94,
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    slots: ['Thursday, 11:00 AM', 'Friday, 1:30 PM', 'Next Mon, 9:00 AM']
  },
  {
    id: 'doc-3',
    name: 'Dr. Elena Rostova, MD',
    title: 'Pediatric & Inflammatory Derm',
    specialty: 'Atopic Eczema & Psoriasis',
    department: 'Immunology',
    contact: '+1 (555) 441-2090',
    email: 'elena.rostova@skinclinic.com',
    rating: 4.95,
    reviews: 210,
    status: 'Absent',
    avatar: 'https://images.unsplash.com/photo-1594824813583-48a54d5d9c22?w=150&auto=format&fit=crop&q=80',
    slots: ['Next Tue, 10:00 AM', 'Next Wed, 3:30 PM']
  }
];

export const initialMedicines = [
  {
    id: 'med-1',
    name: 'Tacrolimus Ointment 0.1%',
    dosage: 'Thin layer',
    timing: 'Morning & Night',
    frequency: '2x Daily',
    takenToday: true,
    totalDoses: 2,
    takenDoses: 2,
    area: 'Right Forearm & Neck',
    refillDate: 'Dec 14, 2026'
  },
  {
    id: 'med-2',
    name: 'Desonide Cream 0.05%',
    dosage: 'Pea-sized amount',
    timing: 'Night before sleep',
    frequency: '1x Daily',
    takenToday: false,
    totalDoses: 1,
    takenDoses: 0,
    area: 'Left Deltoid lesion',
    refillDate: 'Jan 05, 2027'
  },
  {
    id: 'med-3',
    name: 'Cetirizine HCl 10mg',
    dosage: '1 Oral tablet',
    timing: 'Evening with water',
    frequency: '1x Daily',
    takenToday: true,
    totalDoses: 1,
    takenDoses: 1,
    area: 'Systemic Antihistamine',
    refillDate: 'Dec 28, 2026'
  }
];

export const initialScans = [
  {
    id: 'scan-103',
    date: 'Nov 24, 2026',
    relativeTime: '3 days ago',
    bodyArea: 'Right Forearm (Epithelial)',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80',
    aiResult: 'Mild Erythema / Resolving Contact Dermatitis',
    severityScore: 24, // 0-100 scale (lower is better)
    status: 'Improving',
    rednessIndex: 28, // %
    areaCm2: 1.8,
    borderRegularity: '94% Regular',
    symmetry: 'Symmetric',
    notes: 'Significant margin clearance, reduced scale thickness.'
  },
  {
    id: 'scan-102',
    date: 'Nov 12, 2026',
    relativeTime: '15 days ago',
    bodyArea: 'Right Forearm (Epithelial)',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
    aiResult: 'Moderate Papular Erythema',
    severityScore: 52,
    status: 'Stable',
    rednessIndex: 45,
    areaCm2: 2.9,
    borderRegularity: '88% Regular',
    symmetry: 'Mild Asymmetry',
    notes: 'Active flareup post-sun exposure, itching reported.'
  },
  {
    id: 'scan-101',
    date: 'Oct 28, 2026',
    relativeTime: '30 days ago',
    bodyArea: 'Right Forearm (Epithelial)',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80',
    aiResult: 'Acute Contact Dermatitis & Lichenification',
    severityScore: 68,
    status: 'Elevated Risk',
    rednessIndex: 64,
    areaCm2: 3.8,
    borderRegularity: '82% Regular',
    symmetry: 'Moderate Asymmetry',
    notes: 'Initial clinical baseline registered.'
  }
];

export const initialCareSteps = [
  {
    id: 'step-1',
    category: 'Assessment',
    title: 'Bi-Weekly AI Follow-up Scan',
    dateRange: 'Nov 28 - Dec 01',
    status: 'Urgent',
    bullets: ['Capture clear focal shot under natural daylight', 'Verify borders of forearm lesion']
  },
  {
    id: 'step-2',
    category: 'Testing',
    title: 'Patch Allergen Series 40',
    dateRange: 'Dec 05 - Dec 07',
    status: 'Scheduled',
    bullets: ['Avoid topical corticosteroids 48 hrs prior', 'Clinic A - Room 302']
  },
  {
    id: 'step-3',
    category: 'Specialists',
    title: 'Dr. Sarah Jenkins Consultation',
    dateRange: 'Dec 10, 2:30 PM',
    status: 'Confirmed',
    bullets: ['Biopsy evaluation and dermoscopy review', 'Bring full exported PDF summary']
  },
  {
    id: 'step-4',
    category: 'Nutrition',
    title: 'Anti-Inflammatory Protocol',
    dateRange: 'Continuous',
    status: 'Ongoing',
    bullets: ['Omega-3 2000mg + Evening Primrose', 'Maintain hydration > 2.5L/day']
  },
  {
    id: 'step-5',
    category: 'Exercise',
    title: 'Sweat-Trigger Barrier Care',
    dateRange: 'Active Days',
    status: 'Recommended',
    bullets: ['Rinse within 15 min after cardio workouts', 'Apply ceramide barrier cream']
  }
];

export const initialAppointments = [
  {
    id: 'apt-1',
    doctor: 'Dr. Sarah Jenkins, MD',
    date: 'Dec 10, 2026 at 2:30 PM',
    department: 'Cutaneous Medicine',
    type: 'In-Person Dermoscopy',
    reportAttached: true
  }
];
