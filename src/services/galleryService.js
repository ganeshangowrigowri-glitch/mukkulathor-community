import { supabase } from '../lib/supabaseClient'
import { STORAGE_BUCKETS } from '../lib/constants'

export async function listPublishedGallery() {
  const { data, error } = await supabase.from('gallery').select('*').eq('is_published', true).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listAllGallery() {
  const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadGalleryImage(file, { title, description, album }, uploadedBy) {
  const ext = file.name.split('.').pop()
  const path = `${album || 'general'}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKETS.GALLERY).upload(path, file)
  if (uploadError) throw uploadError
  const { data: pub } = supabase.storage.from(STORAGE_BUCKETS.GALLERY).getPublicUrl(path)

  const { data, error } = await supabase
    .from('gallery')
    .insert({ title, description, album, image_url: pub.publicUrl, uploaded_by: uploadedBy })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteGalleryItem(id) {
  const { error } = await supabase.from('gallery').delete().eq('id', id)
  if (error) throw error
}
