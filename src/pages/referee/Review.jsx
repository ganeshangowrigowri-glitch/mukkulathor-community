import { useCallback, useMemo, useState } from 'react'
import { UserCheck, Eye, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { getMyRefereeRow, getMyRecommendations, getApplicantDetail } from '../../services/refereeService'
import FadeIn from '../../components/ui/FadeIn'
import Tabs from '../../components/ui/Tabs'
import Badge from '../../components/ui/Badge'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import ApplicantReviewModal from '../../components/referee/ApplicantReviewModal'
import { RECOMMENDATION_STATUS_LABELS, RECOMMENDATION_STATUS_BADGE } from '../../lib/constants'
import { formatDistanceToNow } from 'date-fns'

export default function ReviewApplicants() {
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

  const [tab, setTab] = useState('pending')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const filtered = useMemo(() => {
    return (recsQuery.data ?? []).filter((rec) => {
      const matchesTab = tab === 'all' || rec.status === tab
      const matchesQuery = !query || rec.profiles?.full_name?.toLowerCase().includes(query.toLowerCase())
      return matchesTab && matchesQuery
    })
  }, [recsQuery.data, tab, query])

  const counts = useMemo(() => {
    const list = recsQuery.data ?? []
    return {
      pending: list.filter((r) => r.status === 'pending').length,
      approved: list.filter((r) => r.status === 'approved').length,
      rejected: list.filter((r) => r.status === 'rejected').length,
      all: list.length,
    }
  }, [recsQuery.data])

  async function openReview(rec) {
    setSelected(rec)
    setDetail(null)
    setDetailLoading(true)
    try {
      const d = await getApplicantDetail(rec.applicant_id)
      setDetail(d)
    } finally {
      setDetailLoading(false)
    }
  }

  if (refereeRowQuery.loading) return <SkeletonList count={4} />
  if (refereeRowQuery.error) return <ErrorState onRetry={refereeRowQuery.refetch} message="Couldn't load your referee profile." />
  if (!refereeRowQuery.data) {
    return <EmptyState icon={UserCheck} title="You're not an active referee" description="Contact the administrator if this seems incorrect." />
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Review Applicants</h1>
        <p className="mt-1 text-sm text-slate-500">Recommend or reject applicants who have selected you as a referee.</p>
      </FadeIn>

      <FadeIn delay={50} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={[
            { value: 'pending', label: `Pending (${counts.pending})` },
            { value: 'approved', label: `Recommended (${counts.approved})` },
            { value: 'rejected', label: `Rejected (${counts.rejected})` },
            { value: 'all', label: `All (${counts.all})` },
          ]}
          active={tab}
          onChange={setTab}
        />
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search applicants…" className="input-field pl-9" />
        </div>
      </FadeIn>

      {recsQuery.loading ? (
        <SkeletonList count={4} />
      ) : recsQuery.error ? (
        <ErrorState onRetry={recsQuery.refetch} message="Couldn't load applicants." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserCheck} title="No applicants here" description="Try a different tab or search term." />
      ) : (
        <div className="space-y-3">
          {filtered.map((rec, i) => (
            <FadeIn key={rec.id} delay={i * 30} className="card flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-sm font-semibold text-navy-700">
                  {rec.profiles?.profile_photo_url ? (
                    <img src={rec.profiles.profile_photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    rec.profiles?.full_name?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{rec.profiles?.full_name}</p>
                  <p className="truncate text-xs capitalize text-slate-400">
                    {rec.profiles?.branch} {rec.profiles?.district ? `· ${rec.profiles.district}` : ''}
                  </p>
                  <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(rec.created_at), { addSuffix: true })}</p>
                </div>
              </div>
              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <Badge tone={RECOMMENDATION_STATUS_BADGE[rec.status]}>{RECOMMENDATION_STATUS_LABELS[rec.status]}</Badge>
                <button onClick={() => openReview(rec)} className="btn-outline">
                  <Eye size={15} /> {rec.status === 'pending' ? 'Review' : 'View'}
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      <ApplicantReviewModal
        open={!!selected}
        onClose={() => setSelected(null)}
        recommendation={selected}
        detail={detail}
        loading={detailLoading}
        onDecided={recsQuery.refetch}
      />
    </div>
  )
}
