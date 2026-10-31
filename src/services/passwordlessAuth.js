import { supabase } from '../lib/supabaseClient'

export async function loginOrRegister({ fullName, email }) {
  const { data, error } = await supabase.functions.invoke('passwordless-login', {
    body: { fullName: fullName?.trim(), email: email?.trim().toLowerCase() },
  })
   if (error) {
    let message = 'Could not reach the login service. Please try again.'
    try {
      const body = await error.context.json()
      if (body?.error) message = body.error
    } catch {
      // keep the default message
    }
    return { data: null, error: { message } }
  }
  if (!data?.ok) return { data: null, error: { message: data?.error ?? 'Login failed.' } }

  const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: data.token_hash, type: 'magiclink',
  })
  if (verifyError) return { data: null, error: verifyError }
  return { data: { ...sessionData, isNew: data.isNew }, error: null }
}
