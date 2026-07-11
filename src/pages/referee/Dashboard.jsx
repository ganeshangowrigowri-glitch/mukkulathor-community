import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { UserCheck, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { getMyRefereeRow, getMyRecommendations } from '../../services/refereeService'
import FadeIn from '../../components/ui/FadeIn'
import StatCard from '../../components/ui/StatCard'
import { SkeletonGrid, SkeletonCard, SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
import { RECOMMENDATION_STATUS_LABELS, RECOMMENDATION_STATUS_BADGE } from '../../lib/constants'
import { formatDistanceToNow } from 'date-fns'

export default function RefereeDashboard() {
  const { profile } = useAuth()
  const profileId = profile?.id

  const refereeRowQuery = useSupabaseQuery(
    useCallback(() => (profileId ? getMyRefereeRow(profileId) : Promise.resolve(null)), [profileId]),
    [profileId]
  )
  const refereeRowId = refereeRowQuery.data?.id

  const recsQuery = useSupabaseQuery(
    useCallback(() => (refereeRowId ? getMyRecommendations(refereeRowId) : Promise.resolve([])), [refereeRowId]),
    [refereeRowId],
    { initialData: [], enabled: !!refereeRowId }
  )

  const stats = useMemo(() => {
    const list = recsQuery.data ?? []
    return {
      pending: list.filter((r) => r.status === 'pending').length,
      approved: list.filter((r) => r.status === 'approved').length,
      rejected: list.filter((r) => r.status === 'rejected').length,
      total: list.length,
    }
  }, [recsQuery.data])

  const recentActivity = (recsQuery.data ?? []).filter((r) => r.decided_at).slice(0, 5)

  if (refereeRowQuery.loading) return <SkeletonGrid count={4} ItemComponent={SkeletonCard} />
  if (refereeRowQuery.error) return <ErrorState onRetry={refereeRowQuery.refetch} message="Couldn't load your referee profile." />
  if (!refereeRowQuery.data) {
    return (
      <EmptyState
        icon={UserCheck}
        title="You're not currently an active referee"
        description="Contact the community administrator if you believe this is incorrect."
      />
    )
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900 sm:text-3xl">
          Welcome, {profile.full_name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {refereeRowQuery.data.designation || 'Referee'} {refereeRowQuery.data.region ? `· ${refereeRowQuery.data.region}` : ''}
        </p>
      </FadeIn>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FadeIn delay={50}><StatCard icon={Clock} label="Pending Review" value={stats.pending} tone="gold" /></FadeIn>
        <FadeIn delay={100}><StatCard icon={CheckCircle2} label="Recommended" value={stats.approved} tone="green" /></FadeIn>
        <FadeIn delay={150}><StatCard icon={XCircle} label="Rejected" value={stats.rejected} tone="red" /></FadeIn>
        <FadeIn delay={200}><StatCard icon={UserCheck} label="Total Assigned" value={stats.total} tone="navy" /></FadeIn>
      </div>

      {stats.pending > 0 && (
        <FadeIn delay={250} className="card flex flex-col items-start justify-between gap-3 border-gold-200 bg-gold-50/40 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-base font-semibold text-navy-900">
              {stats.pending} application{stats.pending !== 1 && 's'} waiting on your review
            </p>
            <p className="mt-0.5 text-sm text-slate-500">Applicants can't move forward until referees respond.</p>
          </div>
          <Link to="/referee/review" className="btn-gold w-full sm:w-auto">
            Review Now <ArrowRight size={15} />
          </Link>
        </FadeIn>
      )}

      <FadeIn delay={300} className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-900">Recent Activity</h3>
          <Link to="/referee/review" className="text-xs font-medium text-navy-700 hover:underline">View all</Link>
        </div>
        {recsQuery.loading ? (
          <SkeletonList count={3} />
        ) : recsQuery.error ? (
          <ErrorState onRetry={recsQuery.refetch} message="Couldn't load activity." />
        ) : recentActivity.length === 0 ? (
          <EmptyState icon={UserCheck} title="No activity yet" description="Your recommendation decisions will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((rec) => (
              <li key={rec.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-sm font-semibold text-navy-700">
                    {rec.profiles?.profile_photo_url ? (
                      <img src={rec.profiles.profile_photo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      rec.profiles?.full_name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{rec.profiles?.full_name}</p>
                    <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(rec.decided_at), { addSuffix: true })}</p>
                  </div>
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
