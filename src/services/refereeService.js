import { supabase } from '../lib/supabaseClient'

/** Active referees for the registration picker. Uses a narrow RPC (names only)
 * so members never need read access to other members' profile rows. The result
 * is mapped back to the shape RefereesSection already expects. */
export async function listActiveReferees() {
  const { data, error } = await supabase.rpc('list_active_referees')
  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.id,
    designation: r.designation,
    region: r.region,
    profiles: { full_name: r.full_name, branch: r.branch, district: r.district },
  }))
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

/** The applicant's own recommendations (or any applicant's, for admins) with
 * referee names, via RPC. Mapped to the { referees: { profiles: { full_name } } }
 * shape MembershipStatus already reads. */
export async function getRecommendationsForApplicant(applicantId) {
  const { data, error } = await supabase.rpc('get_recommendations_for_applicant', { p_applicant_id: applicantId })
  if (error) throw error
  return (data ?? []).map(({ referee_name, ...rec }) => ({
    ...rec,
    referees: { id: rec.referee_id, profiles: { full_name: referee_name } },
  }))
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
