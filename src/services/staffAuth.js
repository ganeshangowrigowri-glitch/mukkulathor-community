import { supabase } from '../lib/supabaseClient'

export async function staffLogin({ username, password, portal }) {
  const { data, error } = await supabase.functions.invoke('staff-login', {
    body: { username: username?.trim(), password, portal },
  })
  if (error) {
    let message = 'Could not reach the login service. Please try again.'
    try {
      const body = await error.context.json()
      if (body?.error) message = body.error
    } catch { /* keep default message */ }
    return { error: { message } }
  }
  if (!data?.ok) return { error: { message: data?.error ?? 'Login failed.' } }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  })
  if (sessionError) return { error: { message: 'Could not start your session. Please try again.' } }
  return { error: null }
}