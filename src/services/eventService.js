import { supabase } from '../lib/supabaseClient'
import { STORAGE_BUCKETS } from '../lib/constants'

export async function listPublishedEvents() {
  const { data, error } = await supabase.from('events').select('*').eq('is_published', true).order('event_date', { ascending: true })
  if (error) throw error
  return data
}

export async function listAllEvents() {
  const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createEvent(payload) {
  const { data, error } = await supabase.from('events').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateEvent(id, payload) {
  const { data, error } = await supabase.from('events').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function uploadEventBanner(file) {
  const ext = file.name.split('.').pop()
  const path = `banners/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(STORAGE_BUCKETS.EVENT_BANNERS).upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from(STORAGE_BUCKETS.EVENT_BANNERS).getPublicUrl(path)
  return data.publicUrl
}

// ---- RSVPs ------------------------------------------------------------------
export async function getMyRsvp(eventId, profileId) {
  const { data, error } = await supabase.from('event_rsvps').select('*').eq('event_id', eventId).eq('profile_id', profileId).maybeSingle()
  if (error) throw error
  return data
}

export async function setRsvp(eventId, profileId, status) {
  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert({ event_id: eventId, profile_id: profileId, status }, { onConflict: 'event_id,profile_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getRsvpSummary(eventId) {
  const { data, error } = await supabase.from('event_rsvp_summary').select('*').eq('event_id', eventId).maybeSingle()
  if (error) throw error
  return data || { going_count: 0, interested_count: 0, not_going_count: 0 }
}

export async function getMyRsvpsForEvents(profileId, eventIds) {
  if (!eventIds.length) return {}
  const { data, error } = await supabase.from('event_rsvps').select('event_id, status').eq('profile_id', profileId).in('event_id', eventIds)
  if (error) throw error
  return Object.fromEntries(data.map((r) => [r.event_id, r.status]))
}
