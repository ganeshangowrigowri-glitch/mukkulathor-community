export const REGISTRATION_TYPES = [
  { value: 'family_head', label: 'Family Head', description: "Register as the head of your family — your application becomes the family's primary record." },
  { value: 'individual_member', label: 'Individual Member', description: 'Register as a member of an already-registered family (you can link your Family ID in Step 3).' },
]

export const RECOMMENDATION_STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Recommended',
  rejected: 'Rejected',
}

export const RECOMMENDATION_STATUS_BADGE = {
  pending: 'amber',
  approved: 'green',
  rejected: 'red',
}

export const BRANCHES = [
  { value: 'kallar', label: 'Kallar' },
  { value: 'maravar', label: 'Maravar' },
  { value: 'agamudayar', label: 'Agamudayar' },
]

export const SUB_CLANS_BY_BRANCH = {
  kallar: ['Piramarai', 'Esanattu', 'Gandarva Kottai',],
  agamudayar: ['Rajakulam', 'Rajavasal',],
  maravar: ['Sembinattu', 'Kondaiyam','Agatha', 'Uppu Kattai'],
}

export const TITLES_BY_BRANCH = {
  kallar: ['Thevar', 'Nattar', 'Vandaiyar', 'Thondaman', 'Pallavaryar', 'Malavaryar', 'Vallavarayar', 'Anjathevar'],
  agamudayar: ['Thevar', 'Servai', 'Mudaliyar', 'Pillai'],
  maravar: ['Thevar', 'Sethupathiyar', 'Maran', 'Thondaman'],
}

export const GOTHRAMS = ['Siva Gotharam', 'Vilavaraya Gotharam']

export const BIRTH_COUNTRIES = ['Sri Lanka', 'India']
export const LINEAGE_COUNTRIES = BIRTH_COUNTRIES

export const QUALIFICATION_LEVELS = [
  { value: 'ol', label: 'O/L', placeholder: 'School name' },
  { value: 'al', label: 'A/L', placeholder: 'School name' },
  { value: 'diploma', label: 'Diploma', placeholder: 'School / institute name' },
  { value: 'degree', label: 'Degree', placeholder: 'College / university name' },
  { value: 'master', label: "Master's", placeholder: 'College / university name' },
  { value: 'phd', label: 'PhD', placeholder: 'University name' },
  { value: 'doctor', label: 'Doctor (Medical)', placeholder: 'University name' },
  { value: 'other', label: 'Other', placeholder: 'Specify institution / qualification' },
]

export const PROFESSIONAL_CATEGORIES = [
  { value: 'business', label: 'Business' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'banker', label: 'Banker' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'other', label: 'Other' },
]

export const BUSINESS_NATURE_OPTIONS = ['Hardware', 'Jewellery', 'Stationery', 'Other']
export const BANK_POSITION_OPTIONS = ['Manager', 'Assistant Manager', 'Banking Assistant', 'Teller / Cashier', 'Credit Officer', 'Accounts Officer', 'IT Officer', 'Other']
export const VISION_REASONS = [
  'Know my born tree',
  'Build of relationship',
  'Interest in gathering',
  'Help to community',
  'For next generation',
  'Build strong community',
  'Matrimony',
  'Other',
]

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const MARRIAGE_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
]
export const MARITAL_STATUSES = MARRIAGE_STATUSES

export const RELATION_TYPES = [
  { value: 'great_grandfather', label: 'Great Grandfather' },
  { value: 'great_grandmother', label: 'Great Grandmother' },
  { value: 'grandfather', label: 'Grandfather' },
  { value: 'grandmother', label: 'Grandmother' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'family_head', label: 'Family Head' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
]

export const RELATION_LABELS = RELATION_TYPES.reduce((acc, r) => ({ ...acc, [r.value]: r.label }), {})

export const RELATION_GENERATION_LEVEL = {
  great_grandfather: -3, great_grandmother: -3,
  grandfather: -2, grandmother: -2,
  father: -1, mother: -1,
  family_head: 0, spouse: 0, sibling: 0, other: 0,
  child: 1,
}

export const GENERATION_LABELS = {
  '-3': 'Great Grandparents',
  '-2': 'Grandparents',
  '-1': 'Parents',
  0: 'Your Generation',
  1: 'Children',
}

export const DOCUMENT_TYPES = [
  { value: 'profile_photo', label: 'Profile Photo' },
  { value: 'family_photo', label: 'Family Photo' },
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'address_proof', label: 'Address Proof' },
  { value: 'supporting_document', label: 'Supporting Document' },
]

export const REGISTRATION_STATUS_LABELS = {
  draft: 'Draft',
  pending_referee_verification: 'Pending Referee Verification',
  pending_admin_approval: 'Pending Admin Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
}

export const REGISTRATION_STATUS_BADGE = {
  draft: 'badge-grey',
  pending_referee_verification: 'badge-amber',
  pending_admin_approval: 'badge-amber',
  approved: 'badge-green',
  rejected: 'badge-red',
  suspended: 'badge-red',
}

export const ROLE_NAMES = {
  1: 'member',
  2: 'referee',
  3: 'admin',
}

export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  FAMILY_PHOTOS: 'family-photos',
  DOCUMENTS: 'documents',
  GALLERY: 'gallery',
  EVENT_BANNERS: 'event-banners',
  ACHIEVER_PHOTOS: 'achiever-photos',
  SOCIETY_PHOTOS: 'society-photos',
}