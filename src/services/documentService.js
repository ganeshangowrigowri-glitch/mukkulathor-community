import { supabase } from '../lib/supabaseClient'
import { STORAGE_BUCKETS } from '../lib/constants'

export async function listDocuments(profileId) {
  const { data, error } = await supabase.from('documents').select('*').eq('profile_id', profileId).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadDocument(profileId, file, docType) {
  const ext = file.name.split('.').pop()
  const path = `${profileId}/${docType}-${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKETS.DOCUMENTS).upload(path, file)
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('documents')
    .insert({ profile_id: profileId, doc_type: docType, file_url: path, file_name: file.name, file_size: file.size })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getDocumentSignedUrl(path) {
  const { data, error } = await supabase.storage.from(STORAGE_BUCKETS.DOCUMENTS).createSignedUrl(path, 60 * 10)
  if (error) throw error
  return data.signedUrl
}

export async function deleteDocument(id, path) {
  await supabase.storage.from(STORAGE_BUCKETS.DOCUMENTS).remove([path])
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw error
}
