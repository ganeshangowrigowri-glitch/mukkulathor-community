import { supabase } from '../lib/supabaseClient'

export async function loginOrRegister({ fullName, email }) {
  const { data, error } = await supabase.functions.invoke('passwordless-login', {
    body: { fullName: fullName?.trim(), email: email?.trim().toLowerCase() },
  })
  if (error) return { data: null, error: { message: 'Could not reach the login service. Please try again.' } }
  if (!data?.ok) return { data: null, error: { message: data?.error ?? 'Login failed.' } }

  const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: data.token_hash, type: 'magiclink',
  })
  if (verifyError) return { data: null, error: verifyError }
  return { data: { ...sessionData, isNew: data.isNew }, error: null }
}