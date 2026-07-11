import { supabase } from '../lib/supabaseClient'

export async function updateNotificationPreferences(profileId, preferences) {
  const { data, error } = await supabase.from('profiles').update({ notification_preferences: preferences }).eq('id', profileId).select().single()
  if (error) throw error
  return data
}

export async function updateDirectoryVisibility(profileId, isVisible) {
  const { data, error } = await supabase.from('profiles').update({ is_directory_visible: isVisible }).eq('id', profileId).select().single()
  if (error) throw error
  return data
}

export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function changeEmail(newEmail) {
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) throw error
}
