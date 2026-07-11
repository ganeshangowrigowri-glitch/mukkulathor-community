/**
 * Computes a profile-completion percentage for the Member Dashboard overview.
 * Pure function — no network calls — so it can be unit tested and reused
 * anywhere (dashboard card, settings page, etc.)
 */
const WEIGHTED_FIELDS = [
  { key: 'full_name', weight: 1 },
  { key: 'gender', weight: 1 },
  { key: 'dob', weight: 1 },
  { key: 'mobile', weight: 1 },
  { key: 'email', weight: 1 },
  { key: 'address', weight: 1 },
  { key: 'village', weight: 1 },
  { key: 'branch', weight: 1 },
  { key: 'native_place', weight: 1 },
  { key: 'district', weight: 1 },
  { key: 'country', weight: 1 },
  { key: 'religion', weight: 1 },
  { key: 'education', weight: 1 },
  { key: 'occupation', weight: 1 },
  { key: 'profile_photo_url', weight: 2 },
]

export function calculateProfileCompletion(profile, { familyMembersCount = 0, documentsCount = 0 } = {}) {
  if (!profile) return 0

  let earned = 0
  let total = 0

  WEIGHTED_FIELDS.forEach(({ key, weight }) => {
    total += weight
    if (profile[key] !== null && profile[key] !== undefined && String(profile[key]).trim() !== '') {
      earned += weight
    }
  })

  // Family + documents contribute a fixed share so the score reflects more
  // than just personal fields.
  total += 3
  if (familyMembersCount > 0) earned += 2
  if (documentsCount > 0) earned += 1

  return Math.round((earned / total) * 100)
}

export function getMissingFieldLabels(profile) {
  const labels = {
    full_name: 'Full name', gender: 'Gender', dob: 'Date of birth', mobile: 'Mobile number',
    email: 'Email', address: 'Address', village: 'Village/Town', branch: 'Branch',
    native_place: 'Native place', district: 'District', country: 'Country', religion: 'Religion',
    education: 'Education', occupation: 'Occupation', profile_photo_url: 'Profile photo',
  }
  if (!profile) return Object.values(labels)
  return WEIGHTED_FIELDS
    .filter(({ key }) => !profile[key] || String(profile[key]).trim() === '')
    .map(({ key }) => labels[key])
}
