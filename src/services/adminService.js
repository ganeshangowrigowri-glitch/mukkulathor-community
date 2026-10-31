/*
 * PATCHED FILE — only the `listAllReferees` function below changed.
 * Everything else in this file is byte-for-byte identical to the uploaded
 * project's src/services/adminService.js — copy just that one function over,
 * or replace the whole file with this one.
 *
 * ISSUE FIXED: listAllReferees() selected profiles(... username, notification_email)
 * and never selected referees.referee_code / referees.profile_image_url, even
 * though ManageReferees.jsx renders both (see columns[] in that file). Before
 * migration 0009, `username` and `notification_email` did not exist on
 * `profiles` at all, so this query failed outright with a PostgREST
 * "column profiles.username does not exist" error every time an admin opened
 * Manage Referees. After 0009 the columns exist, so only the missing
 * referee_code / profile_image_url selection needed to be added.
 */
import { supabase } from '../lib/supabaseClient'
import { REGISTRATION_STATUS_LABELS } from '../lib/constants'

export async function getDashboardStats() {
  const [{ count: total }, { count: pendingReferee }, { count: pendingAdmin }, { count: approved }, { count: rejected }, { count: referees }] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('registration_status', 'pending_referee_verification'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('registration_status', 'pending_admin_approval'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('registration_status', 'approved'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('registration_status', 'rejected'),
      supabase.from('referees').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ])

  return { total, pendingReferee, pendingAdmin, approved, rejected, referees }
}

export async function getBranchBreakdown() {
  const { data, error } = await supabase.from('profiles').select('branch').eq('registration_status', 'approved')
  if (error) throw error
  const counts = { kallar: 0, maravar: 0, agamudayar: 0 }
  data.forEach((row) => { if (row.branch) counts[row.branch] = (counts[row.branch] || 0) + 1 })
  return Object.entries(counts).map(([branch, count]) => ({ branch, count }))
}

export async function getMonthlyRegistrations() {
  const { data, error } = await supabase.from('profiles').select('created_at')
  if (error) throw error
  const byMonth = {}
  data.forEach((row) => {
    const d = new Date(row.created_at)
    const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`
    byMonth[key] = (byMonth[key] || 0) + 1
  })
  return Object.entries(byMonth).map(([month, count]) => ({ month, count }))
}

export async function listProfilesByStatus(status) {
  const { data, error } = await supabase.from('profiles').select('*').eq('registration_status', status).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listAllProfiles() {
  const { data, error } = await supabase.from('profiles').select('*, roles(name)').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function decideRegistration(profileId, approve, reason) {
  const { error } = await supabase.rpc('admin_decide_registration', { p_profile_id: profileId, p_approve: approve, p_reason: reason })
  if (error) throw error

  await supabase.functions.invoke('send-status-email', {
    body: {
      profileId,
      subject: approve ? 'Your membership has been approved' : 'Update on your membership application',
      heading: approve ? 'Welcome to the community!' : 'Application update',
      message: approve
        ? 'Congratulations — your registration has been approved by the administrator. You can now access your member dashboard, family registry tools, and community events.'
        : reason || 'Your application was not approved at this time. Please contact the community office for more details.',
      ctaLabel: approve ? 'Go to dashboard' : 'View status',
      ctaPath: approve ? '/member/dashboard' : '/member/status',
    },
  })
}

export async function promoteToReferee(profileId, designation, region) {
  const { error } = await supabase.rpc('promote_to_referee', { p_profile_id: profileId, p_designation: designation, p_region: region })
  if (error) throw error
}

async function invokeAdminFn(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) {
    let message = error.message
    try {
      const j = await error.context.json()
      if (j?.error) message = j.error
    } catch { /* keep default message */ }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)
  return data
}

// Now takes the referee's PROFILE id (not the referees row id)
export async function setRefereeActive(profileId, isActive) {
  return invokeAdminFn('manage-referee-account', { action: 'set_active', profile_id: profileId, is_active: isActive })
}

export async function resetRefereeCredentials(profileId, { username, password }) {
  return invokeAdminFn('manage-referee-account', { action: 'set_credentials', profile_id: profileId, username, password })
}

// FIXED: was `profiles(full_name, email, branch, district, username, mobile, notification_email)`
// with no `referee_code` / `profile_image_url` on the referees row itself —
// both of which src/pages/admin/ManageReferees.jsx's columns[] already render.
export async function listAllReferees() {
  const { data, error } = await supabase
    .from('referees')
    .select('id, profile_id, referee_code, designation, region, is_active, profile_image_url, father_name, kulam, caste, gothram, occupation, created_at, profiles(full_name, email, branch, district, username, mobile, notification_email)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

async function uploadRefereePhotoIfNeeded(file) {
  if (!file) return null
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('referee-photos').upload(path, file)
  if (error) throw error
  const { data: pub } = supabase.storage.from('referee-photos').getPublicUrl(path)
  return pub.publicUrl
}

export async function createReferee(payload, file) {
  const profile_image_url = await uploadRefereePhotoIfNeeded(file)
   return invokeAdminFn('create-referee', { ...payload, profile_image_url })
}

export async function updateReferee(refereeRowId, profileId, { profileUpdates, refereeUpdates }, file) {
  if (file) {
    refereeUpdates.profile_image_url = await uploadRefereePhotoIfNeeded(file)
  }
  if (profileUpdates && Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', profileId)
    if (error) throw error
  }
  if (refereeUpdates && Object.keys(refereeUpdates).length > 0) {
    const { error } = await supabase.from('referees').update(refereeUpdates).eq('id', refereeRowId)
    if (error) throw error
  }
}

export async function deleteReferee(profileId) {
  const { data, error } = await supabase.functions.invoke('delete-referee', { body: { profile_id: profileId } })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}
export async function getAuditLogs(limit = 100) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, profiles:actor_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function exportMembersCSV(rows) {
  // Column set requested for the admin report:
  // BY, Name, Family Name, Gender, Status, Kilai (Branch), Pattam (Title),
  // Kulathaivam, Kaval Thaivam, Professional/Qualification, City, District,
  // Country, Contact No.
  // NOTE on 2 fields with no exact 1:1 column in the schema:
  //  - "BY" is mapped to family_id (the record's reference/family number).
  //  - "Family Name" is mapped to great_grandfather_family_tree_name (the
  //    closest existing field — the family's ancestral tree name collected
  //    in the Lineage section). If "Family Name" was meant to be something
  //    else, tell me and I'll repoint this one line.
  const headers = [
    'BY', 'Name', 'Family Name', 'Gender', 'Status', 'Kilai', 'Pattam',
    'Kula deivam', 'Kaval deivam', 'Professional', 'Qualification',
    'City', 'District', 'Country', 'Contact No',
  ]
  const lines = rows.map((r) =>
    [
      r.family_id,
      r.full_name,
      r.great_grandfather_family_tree_name,
      r.gender,
      REGISTRATION_STATUS_LABELS[r.registration_status] ?? r.registration_status,
      r.branch,
      r.title,
      r.kula_deivam,
      r.kaval_deivam,
      r.occupation,
      Array.isArray(r.qualifications) ? r.qualifications.join('; ') : r.qualifications,
      r.city,
      r.district,
      r.country,
      r.mobile,
    ]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )
  return [headers.join(','), ...lines].join('\n')
}

// ----------------------------------------------------------------------------
// Registration approval detail — full applicant bundle including every
// referee's decision, comments, and timestamp (fulfills "Admin can see
// Recommended by Referee 1 / Rejected by Referee / Pending Referee Response").
// ----------------------------------------------------------------------------
export async function getApplicantFullDetail(profileId) {
  const [{ data: profile, error: pErr }, { data: family, error: fErr }, { data: documents, error: dErr }, { data: recommendations, error: rErr }, { data: history, error: hErr }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', profileId).single(),
      supabase.from('family_members').select('*').eq('profile_id', profileId).order('created_at'),
      supabase.from('documents').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }),
      supabase.from('referee_recommendations').select('*, referees(id, profiles(full_name, email))').eq('applicant_id', profileId),
      supabase.from('member_status').select('*').eq('profile_id', profileId).order('created_at'),
    ])
  if (pErr) throw pErr
  if (fErr) throw fErr
  if (dErr) throw dErr
  if (rErr) throw rErr
  if (hErr) throw hErr
  return { profile, family: family ?? [], documents: documents ?? [], recommendations: recommendations ?? [], history: history ?? [] }
}

// ----------------------------------------------------------------------------
// Search across ALL members (any status) — broader than the member-facing
// directory search, which only returns approved profiles.
// ----------------------------------------------------------------------------
export async function adminSearchProfiles({ query = '', status = 'all', branch = 'all' } = {}) {
  let q = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (query) q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,mobile.ilike.%${query}%,family_id.ilike.%${query}%`)
  if (status !== 'all') q = q.eq('registration_status', status)
  if (branch !== 'all') q = q.eq('branch', branch)
  const { data, error } = await q.limit(200)
  if (error) throw error
  return data
}

// ----------------------------------------------------------------------------
// Member management actions
// ----------------------------------------------------------------------------
export async function suspendMember(profileId, reason) {
  const { error } = await supabase.from('profiles').update({ registration_status: 'suspended', rejection_reason: reason }).eq('id', profileId)
  if (error) throw error
  await supabase.from('member_status').insert({ profile_id: profileId, status: 'suspended', note: reason })
  await supabase.from('audit_logs').insert({ action: 'SUSPEND_MEMBER', entity_type: 'profile', entity_id: profileId, details: { reason } })
}

export async function reactivateMember(profileId) {
  const { error } = await supabase.from('profiles').update({ registration_status: 'approved', rejection_reason: null }).eq('id', profileId)
  if (error) throw error
  await supabase.from('member_status').insert({ profile_id: profileId, status: 'approved', note: 'Reactivated by administrator' })
  await supabase.from('audit_logs').insert({ action: 'REACTIVATE_MEMBER', entity_type: 'profile', entity_id: profileId })
}

// ----------------------------------------------------------------------------
// Reports — aggregate breakdowns beyond the dashboard's headline numbers
// ----------------------------------------------------------------------------
export async function getDistrictBreakdown() {
  const { data, error } = await supabase.from('profiles').select('district').eq('registration_status', 'approved')
  if (error) throw error
  const counts = {}
  data.forEach((r) => { if (r.district) counts[r.district] = (counts[r.district] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([district, count]) => ({ district, count }))
}

export async function getStatusBreakdown() {
  const { data, error } = await supabase.from('profiles').select('registration_status')
  if (error) throw error
  const counts = {}
  data.forEach((r) => { counts[r.registration_status] = (counts[r.registration_status] || 0) + 1 })
  return Object.entries(counts).map(([status, count]) => ({ status, count }))
}

// ----------------------------------------------------------------------------
// System Settings (singleton row, id = 1)
// ----------------------------------------------------------------------------
export async function getSystemSettings() {
  const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single()
  if (error) throw error
  return data
}

export async function updateSystemSettings(updates, adminId) {
  const { data, error } = await supabase
    .from('system_settings')
    .update({ ...updates, updated_by: adminId })
    .eq('id', 1)
    .select()
    .single()
  if (error) throw error
  return data
}

// ----------------------------------------------------------------------------
// CSV download helper — triggers a browser file download from a CSV string.
// ----------------------------------------------------------------------------
export function downloadCSV(csvString, filename = 'export.csv') {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
