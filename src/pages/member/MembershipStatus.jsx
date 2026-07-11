import { useCallback } from 'react'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { getMemberStatusHistory } from '../../services/profileService'
import { getRecommendationsForApplicant } from '../../services/refereeService'
import FadeIn from '../../components/ui/FadeIn'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import Timeline from '../../components/ui/Timeline'
import Badge from '../../components/ui/Badge'
import { RECOMMENDATION_STATUS_LABELS, RECOMMENDATION_STATUS_BADGE, REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_BADGE } from '../../lib/constants'

export default function MembershipStatus() {
  const { profile } = useAuth()
  const profileId = profile?.id

  const historyQuery = useSupabaseQuery(
    useCallback(() => (profileId ? getMemberStatusHistory(profileId) : Promise.resolve([])), [profileId]),
    [profileId], { initialData: [] }
  )
  const recsQuery = useSupabaseQuery(
    useCallback(() => (profileId ? getRecommendationsForApplicant(profileId) : Promise.resolve([])), [profileId]),
    [profileId], { initialData: [] }
  )

  if (!profile) return null

  const steps = buildTimelineSteps(profile, historyQuery.data ?? [])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Membership Status</h1>
        <p className="mt-1 text-sm text-slate-500">Track your application from submission to active membership.</p>
      </FadeIn>

      <FadeIn delay={50} className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs text-slate-400">Current Status</p>
          <div className="mt-1.5">
            <Badge tone={REGISTRATION_STATUS_BADGE[profile.registration_status]?.replace('badge-', '')}>
              {REGISTRATION_STATUS_LABELS[profile.registration_status]}
            </Badge>
          </div>
        </div>
        {profile.family_id && (
          <div className="text-right">
            <p className="text-xs text-slate-400">Family ID</p>
            <p className="mt-1 font-mono text-sm font-medium text-navy-900">{profile.family_id}</p>
          </div>
        )}
      </FadeIn>

      <FadeIn delay={100} className="card p-5 sm:p-6">
        <h3 className="mb-5 font-display text-lg font-semibold text-navy-900">Approval Timeline</h3>
        {historyQuery.loading ? <SkeletonList count={4} /> : historyQuery.error ? (
          <ErrorState onRetry={historyQuery.refetch} message="Couldn't load your status history." />
        ) : (
          <Timeline steps={steps} />
        )}
      </FadeIn>

      <FadeIn delay={150} className="card p-5 sm:p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Referee Recommendations</h3>
        {recsQuery.loading ? <SkeletonList count={2} /> : recsQuery.error ? (
          <ErrorState onRetry={recsQuery.refetch} message="Couldn't load referee recommendations." />
        ) : (recsQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-slate-400">No referees selected yet.</p>
        ) : (
          <ul className="space-y-3">
            {recsQuery.data.map((rec) => (
              <li key={rec.id} className="flex items-start justify-between gap-3 rounded-sm2 border border-slate-100 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{rec.referees?.profiles?.full_name ?? 'Referee'}</p>
                  {rec.comments && <p className="mt-0.5 text-xs text-slate-500">"{rec.comments}"</p>}
                  {rec.decided_at && <p className="mt-1 text-xs text-slate-400">{format(new Date(rec.decided_at), 'dd MMM yyyy, h:mm a')}</p>}
                </div>
                <Badge tone={RECOMMENDATION_STATUS_BADGE[rec.status]}>{RECOMMENDATION_STATUS_LABELS[rec.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </FadeIn>
    </div>
  )
}

function buildTimelineSteps(profile, history) {
  const order = ['draft', 'pending_referee_verification', 'pending_admin_approval', 'approved']
  const find = (status) => history.find((h) => h.status === status)
  const isRejected = profile.registration_status === 'rejected'
  const currentIdx = order.indexOf(profile.registration_status)

  const baseSteps = [
    { key: 'draft', title: 'Registration Submitted', description: 'Your application and documents were received.' },
    { key: 'pending_referee_verification', title: 'Referee Verification', description: 'Selected referees review and recommend your application.' },
    { key: 'pending_admin_approval', title: 'Admin Approval', description: 'The administrator performs final review.' },
    { key: 'approved', title: 'Active Membership', description: 'You are a verified member of the registry.' },
  ]

  return baseSteps.map((step, idx) => {
    const entry = find(step.key)
    let state = 'upcoming'
    if (isRejected && idx === currentIdx + 1) state = 'rejected'
    else if (idx < currentIdx || (idx === currentIdx && profile.registration_status === 'approved')) state = 'done'
    else if (idx === currentIdx) state = 'current'

    return {
      ...step,
      state,
      timestamp: entry ? format(new Date(entry.created_at), 'dd MMM yyyy, h:mm a') : undefined,
    }
  })
}
