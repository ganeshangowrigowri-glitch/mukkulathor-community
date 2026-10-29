import { supabase } from '../lib/supabaseClient'

export const MATRIMONY_BUCKETS = { PHOTOS: 'matrimony-photos', HOROSCOPES: 'matrimony-horoscopes' }

// ---- Own profile (direct table access is limited to the owner by RLS) ------
export async function getMyMatrimonyProfile(profileId) {
  const { data, error } = await supabase.from('matrimony_profiles').select('*').eq('profile_id', profileId).maybeSingle()
  if (error) throw error
  return data
}

/** Create or update the caller's matrimony profile. Empty strings become null. */
export async function saveMyMatrimonyProfile(profileId, fields) {
  const clean = {}
  Object.entries(fields).forEach(([k, v]) => {
    clean[k] = v === '' || v === undefined ? null : v
  })
  const { data, error } = await supabase
    .from('matrimony_profiles')
    .upsert({ ...clean, profile_id: profileId }, { onConflict: 'profile_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMyMatrimonyProfile(profileId) {
  const { error } = await supabase.from('matrimony_profiles').delete().eq('profile_id', profileId)
  if (error) throw error
}

// ---- Private files ----------------------------------------------------------
async function uploadPrivate(bucket, profileId, file, prefix, column, oldPath) {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const path = `${profileId}/${prefix}-${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (upErr) throw upErr
  const row = await saveMyMatrimonyProfile(profileId, { [column]: path })
  if (oldPath && oldPath !== path) await supabase.storage.from(bucket).remove([oldPath])
  return row
}

export const uploadMatrimonyPhoto = (profileId, file, oldPath) =>
  uploadPrivate(MATRIMONY_BUCKETS.PHOTOS, profileId, file, 'photo', 'photo_path', oldPath)

export const uploadMatrimonyHoroscope = (profileId, file, oldPath) =>
  uploadPrivate(MATRIMONY_BUCKETS.HOROSCOPES, profileId, file, 'horoscope', 'horoscope_path', oldPath)

export async function getSignedUrl(bucket, path, seconds = 3600) {
  if (!path) return null
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, seconds)
  if (error) return null
  return data?.signedUrl ?? null
}

// ---- Cross-member reads: RPC only (whitelisted columns, consent-gated) ------
export async function browseProfiles({ branch, ageMin, ageMax, district, veettu, limit = 30, offset = 0, onlyShortlist = false } = {}) {
  const { data, error } = await supabase.rpc('mat_browse', {
    p_branch: branch || null,
    p_age_min: ageMin ? Number(ageMin) : null,
    p_age_max: ageMax ? Number(ageMax) : null,
    p_district: district || null,
    p_veettu: veettu || null,
    p_limit: limit,
    p_offset: offset,
    p_only_shortlist: onlyShortlist,
  })
  if (error) throw error
  return data ?? []
}

export async function getMatrimonyProfile(profileId) {
  const { data, error } = await supabase.rpc('mat_get_profile', { p_profile_id: profileId })
  if (error) throw error
  return data
}

export async function sendInterest(toProfileId, message) {
  const { error } = await supabase.rpc('mat_send_interest', { p_to: toProfileId, p_message: message || null })
  if (error) throw error
}

export async function respondToInterest(interestId, accept) {
  const { error } = await supabase.rpc('mat_respond_interest', { p_interest_id: interestId, p_accept: accept })
  if (error) throw error
}

export async function withdrawInterest(interestId) {
  const { error } = await supabase.rpc('mat_withdraw_interest', { p_interest_id: interestId })
  if (error) throw error
}

export async function listRequests() {
  const { data, error } = await supabase.rpc('mat_list_requests')
  if (error) throw error
  return data ?? []
}

export async function toggleShortlist(targetId) {
  const { data, error } = await supabase.rpc('mat_toggle_shortlist', { p_target: targetId })
  if (error) throw error
  return data
}

export async function getMatrimonyDashboard() {
  const { data, error } = await supabase.rpc('mat_dashboard')
  if (error) throw error
  return data
}
