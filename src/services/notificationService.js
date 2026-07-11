import { supabase } from '../lib/supabaseClient'

export async function listNotifications(profileId, { onlyUnread = false } = {}) {
  let q = supabase.from('notifications').select('*').eq('profile_id', profileId).order('created_at', { ascending: false })
  if (onlyUnread) q = q.eq('is_read', false)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(profileId) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('profile_id', profileId).eq('is_read', false)
  if (error) throw error
}

export async function deleteNotification(id) {
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (error) throw error
}
