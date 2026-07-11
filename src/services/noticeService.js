import { supabase } from '../lib/supabaseClient'

export async function listPublishedNotices() {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listAllNotices() {
  const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createNotice(payload) {
  const { data, error } = await supabase.from('notices').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateNotice(id, payload) {
  const { data, error } = await supabase.from('notices').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteNotice(id) {
  const { error } = await supabase.from('notices').delete().eq('id', id)
  if (error) throw error
}
