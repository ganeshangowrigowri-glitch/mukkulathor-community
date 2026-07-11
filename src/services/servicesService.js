import { supabase } from '../lib/supabaseClient'

export async function listActiveServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function listAllServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function createService(payload) {
  const { data, error } = await supabase.from('services').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateService(id, payload) {
  const { data, error } = await supabase.from('services').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteService(id) {
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}
