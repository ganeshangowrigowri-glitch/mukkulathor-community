import { supabase } from '../lib/supabaseClient'
import { STORAGE_BUCKETS } from '../lib/constants'

export async function listActiveSocieties() {
  const { data, error } = await supabase
    .from('societies')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function listAllSocieties() {
  const { data, error } = await supabase
    .from('societies')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

async function uploadImageIfNeeded(file) {
  if (!file) return null
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(STORAGE_BUCKETS.SOCIETY_PHOTOS).upload(path, file)
  if (error) throw error
  const { data: pub } = supabase.storage.from(STORAGE_BUCKETS.SOCIETY_PHOTOS).getPublicUrl(path)
  return pub.publicUrl
}

export async function createSociety(payload, file) {
  const image_url = await uploadImageIfNeeded(file)
  const { data, error } = await supabase
    .from('societies')
    .insert({ ...payload, image_url })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSociety(id, payload, file) {
  const updates = { ...payload }
  if (file) updates.image_url = await uploadImageIfNeeded(file)
  const { data, error } = await supabase.from('societies').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteSociety(id) {
  const { error } = await supabase.from('societies').delete().eq('id', id)
  if (error) throw error
}
