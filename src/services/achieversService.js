import { supabase } from '../lib/supabaseClient'
import { STORAGE_BUCKETS } from '../lib/constants'

export async function listActiveAchievers() {
  const { data, error } = await supabase
    .from('achievers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function listAllAchievers() {
  const { data, error } = await supabase
    .from('achievers')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

async function uploadImageIfNeeded(file) {
  if (!file) return null
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(STORAGE_BUCKETS.ACHIEVER_PHOTOS).upload(path, file)
  if (error) throw error
  const { data: pub } = supabase.storage.from(STORAGE_BUCKETS.ACHIEVER_PHOTOS).getPublicUrl(path)
  return pub.publicUrl
}

export async function createAchiever(payload, file) {
  const image_url = await uploadImageIfNeeded(file)
  const { data, error } = await supabase
    .from('achievers')
    .insert({ ...payload, image_url })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAchiever(id, payload, file) {
  const updates = { ...payload }
  if (file) updates.image_url = await uploadImageIfNeeded(file)
  const { data, error } = await supabase.from('achievers').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteAchiever(id) {
  const { error } = await supabase.from('achievers').delete().eq('id', id)
  if (error) throw error
}
