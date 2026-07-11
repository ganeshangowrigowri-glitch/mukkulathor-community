import { supabase } from '../lib/supabaseClient'
import { STORAGE_BUCKETS } from '../lib/constants'

export async function listFamilyMembers(profileId) {
  const { data, error } = await supabase.from('family_members').select('*').eq('profile_id', profileId).order('created_at')
  if (error) throw error
  return data
}

export async function addFamilyMember(profileId, member) {
  const { data, error } = await supabase.from('family_members').insert({ ...member, profile_id: profileId }).select().single()
  if (error) throw error
  return data
}

export async function updateFamilyMember(id, updates) {
  const { data, error } = await supabase.from('family_members').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteFamilyMember(id) {
  const { error } = await supabase.from('family_members').delete().eq('id', id)
  if (error) throw error
}

/** Replaces all family_members for a profile with the given list — used by the
 * registration wizard where the whole family section is edited as one local array. */
export async function syncFamilyMembers(profileId, members) {
  await supabase.from('family_members').delete().eq('profile_id', profileId)
  if (!members.length) return []
  // eslint-disable-next-line no-unused-vars -- destructure to strip stale `id` before insert
  const payload = members.map(({ id, ...m }) => ({ ...m, profile_id: profileId }))
  const { data, error } = await supabase.from('family_members').insert(payload).select()
  if (error) throw error
  return data
}

export async function uploadFamilyPhoto(profileId, file) {
  const ext = file.name.split('.').pop()
  const path = `${profileId}/family-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(STORAGE_BUCKETS.FAMILY_PHOTOS).upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(STORAGE_BUCKETS.FAMILY_PHOTOS).getPublicUrl(path)
  return data.publicUrl
}

// ---- Family tree edges -----------------------------------------------------
export async function listFamilyTree(profileId) {
  const { data, error } = await supabase
    .from('family_tree')
    .select('*, member:family_members!family_tree_member_id_fkey(*)')
    .eq('profile_id', profileId)
    .order('generation_level')
  if (error) throw error
  return data
}

export async function addTreeNode({ profileId, memberId, parentMemberId, generationLevel = 0, positionOrder = 0 }) {
  const { data, error } = await supabase
    .from('family_tree')
    .insert({ profile_id: profileId, member_id: memberId, parent_member_id: parentMemberId, generation_level: generationLevel, position_order: positionOrder })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeTreeNode(id) {
  const { error } = await supabase.from('family_tree').delete().eq('id', id)
  if (error) throw error
}

// ----------------------------------------------------------------------------
// Auto-tree builder — used by the Registration Wizard (Step 3) to give every
// applicant a sensible default multi-generation tree the moment they save
// their family members. The Member Dashboard's Family Tree page lets them
// rearrange/extend this later (new generations, additional relatives, etc.)
// since `family_tree` is a generic parent/child edge list keyed by
// generation_level — it is not limited to these defaults.
// ----------------------------------------------------------------------------
const GENERATION_BY_RELATION = {
  great_grandfather: -3, great_grandmother: -3,
  grandfather: -2, grandmother: -2,
  father: -1, mother: -1,
  family_head: 0, spouse: 0, sibling: 0, other: 0,
  child: 1,
}

function firstOfType(members, ...types) {
  return members.find((m) => types.includes(m.relation_type))
}

// Only true ancestor generations (-1 and above in seniority) get a real
// parent_member_id link, since that chain is unambiguous. Generation 0 (Self's
// peers — spouse, family head, siblings) and generation 1 (children) are left
// without a stored parent — the Family Tree page renders them grouped by
// generation level instead of relying on a parent edge, which avoids a
// fragile/ambiguous "which row represents Self" problem entirely.
function computeDefaultEdges(members) {
  const greatGrandparent = firstOfType(members, 'great_grandfather', 'great_grandmother')
  const grandparent = firstOfType(members, 'grandfather', 'grandmother')

  return members.map((m, idx) => {
    let parentRef = null
    if (m.relation_type === 'grandfather' || m.relation_type === 'grandmother') {
      parentRef = greatGrandparent
    } else if (m.relation_type === 'father' || m.relation_type === 'mother') {
      parentRef = grandparent
    }
    return {
      member: m,
      generation_level: GENERATION_BY_RELATION[m.relation_type] ?? 0,
      parent_ref: parentRef && parentRef !== m ? parentRef : null,
      position_order: idx,
    }
  })
}

/** Rebuilds family_tree edges for a profile from its current family_members.
 * Call after syncFamilyMembers() so member.id values are stable. */
export async function syncFamilyTree(profileId, savedMembers) {
  await supabase.from('family_tree').delete().eq('profile_id', profileId)
  if (!savedMembers.length) return []

  const edges = computeDefaultEdges(savedMembers)
  const payload = edges.map((e) => ({
    profile_id: profileId,
    member_id: e.member.id,
    parent_member_id: e.parent_ref?.id ?? null,
    generation_level: e.generation_level,
    position_order: e.position_order,
  }))

  const { data, error } = await supabase.from('family_tree').insert(payload).select()
  if (error) throw error
  return data
}

/** Convenience used by the Family Members management page — call after any
 * add/edit/delete so ancestor chain edges stay consistent. */
export async function rebuildFamilyTree(profileId) {
  const members = await listFamilyMembers(profileId)
  return syncFamilyTree(profileId, members)
}
