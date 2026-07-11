import { supabase } from '../lib/supabaseClient'

export async function listActiveReferees() {
  const { data, error } = await supabase
    .from('referees')
    .select('id, designation, region, profiles(id, full_name, branch, district)')
    .eq('is_active', true)
  if (error) throw error
  return data
}

/** Submits the registration: creates referee_recommendations + notifications via RPC,
 * then triggers the referee email Edge Function. */
export async function submitRegistration(refereeIds) {
  const { error } = await supabase.rpc('submit_registration', { p_referee_ids: refereeIds })
  if (error) throw error

  const { data: userData } = await supabase.auth.getUser()
  await supabase.functions.invoke('send-referee-email', { body: { applicantId: userData.user.id } })
}

export async function getMyRecommendations(refereeRowId) {
  const { data, error } = await supabase
    .from('referee_recommendations')
    .select('*, profiles:applicant_id(id, full_name, branch, district, village, profile_photo_url, registration_status, mobile, email)')
    .eq('referee_id', refereeRowId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getMyRefereeRow(profileId) {
  const { data, error } = await supabase.from('referees').select('*').eq('profile_id', profileId).maybeSingle()
  if (error) throw error
  return data
}

export async function decideRecommendation(recommendationId, status, comments) {
  const { error } = await supabase.rpc('decide_referee_recommendation', {
    p_recommendation_id: recommendationId,
    p_status: status,
    p_comments: comments,
  })
  if (error) throw error
}

export async function getRecommendationsForApplicant(applicantId) {
  const { data, error } = await supabase
    .from('referee_recommendations')
    .select('*, referees(id, profiles(full_name))')
    .eq('applicant_id', applicantId)
  if (error) throw error
  return data
}

/** Full applicant detail bundle for the referee review modal — profile,
 * family members, and document metadata in one call. */
export async function getApplicantDetail(applicantId) {
  const [{ data: profile, error: profileErr }, { data: family, error: familyErr }, { data: documents, error: docsErr }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', applicantId).single(),
    supabase.from('family_members').select('*').eq('profile_id', applicantId).order('created_at'),
    supabase.from('documents').select('*').eq('profile_id', applicantId).order('created_at', { ascending: false }),
  ])
  if (profileErr) throw profileErr
  if (familyErr) throw familyErr
  if (docsErr) throw docsErr
  return { profile, family: family ?? [], documents: documents ?? [] }
}
