import { RELATION_GENERATION_LEVEL, GENERATION_LABELS, RELATION_LABELS } from './constants'

/**
 * Groups family_members into generations relative to the applicant (level 0
 * = "You"), sorted from the most senior ancestor to the youngest descendant.
 * This drives the Family Tree page's expandable/collapsible-by-generation
 * UI — a vertical, mobile-safe layout (no wide horizontal org-chart).
 *
 * Returns: [{ level, label, isSelfGeneration, members: [...] }]
 */
export function groupMembersByGeneration(profile, members = []) {
  const byLevel = new Map()

  function pushTo(level, entry) {
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level).push(entry)
  }

  members.forEach((m) => {
    const level = RELATION_GENERATION_LEVEL[m.relation_type] ?? 0
    pushTo(level, { ...m, relationLabel: RELATION_LABELS[m.relation_type] ?? 'Family Member' })
  })

  // Always inject "You" at level 0 so the applicant appears in their own tree
  pushTo(0, {
    id: 'self',
    isSelf: true,
    full_name: profile?.full_name ?? 'You',
    relation_type: 'self',
    relationLabel: 'You',
    gender: profile?.gender,
    dob: profile?.dob,
    occupation: profile?.occupation,
    photo_url: profile?.profile_photo_url,
  })

  const levels = Array.from(byLevel.keys()).sort((a, b) => a - b)

  return levels.map((level) => ({
    level,
    label: GENERATION_LABELS[level] ?? (level < 0 ? `Ancestors (Gen. ${level})` : `Descendants (Gen. ${level})`),
    isSelfGeneration: level === 0,
    members: byLevel.get(level),
  }))
}

export function countTotalRelatives(members = []) {
  return members.length
}
