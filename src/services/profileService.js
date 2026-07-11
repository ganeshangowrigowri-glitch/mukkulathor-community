import { supabase } from '../lib/supabaseClient'
import { STORAGE_BUCKETS } from '../lib/constants'

export async function getProfile(profileId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single()
  if (error) throw error
  return data
}

export async function updateProfile(profileId, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', profileId).select().single()
  if (error) throw error
  return data
}

export async function uploadProfilePhoto(profileId, file) {
  const ext = file.name.split('.').pop()
  const path = `${profileId}/profile-${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKETS.PROFILE_PHOTOS).upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from(STORAGE_BUCKETS.PROFILE_PHOTOS).getPublicUrl(path)
  await updateProfile(profileId, { profile_photo_url: data.publicUrl })
  return data.publicUrl
}

export async function getMemberStatusHistory(profileId) {
  const { data, error } = await supabase
    .from('member_status')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function searchApprovedMembers(query) {
  let q = supabase.from('profiles').select('id, full_name, branch, district, village, family_id, profile_photo_url').eq('registration_status', 'approved')
  if (query) q = q.ilike('full_name', `%${query}%`)
  const { data, error } = await q.limit(50)
  if (error) throw error
  return data
}
