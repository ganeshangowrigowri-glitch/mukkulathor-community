import { useCallback, useState } from 'react'
import { ClipboardList, Eye } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listProfilesByStatus, getApplicantFullDetail } from '../../services/adminService'
import FadeIn from '../../components/ui/FadeIn'
import Tabs from '../../components/ui/Tabs'
import Badge from '../../components/ui/Badge'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import ApplicantDetailModal from '../../components/admin/ApplicantDetailModal'
import { formatDistanceToNow } from 'date-fns'

export default function PendingRegistrations() {
  const [tab, setTab] = useState('pending_referee_verification')
  const { data: applicants, loading, error, refetch } = useSupabaseQuery(
    useCallback(() => listProfilesByStatus(tab), [tab]),
    [tab], { initialData: [] }
  )

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  async function openDetail(profileId) {
    setSelectedId(profileId)
    setDetail(null)
    setDetailLoading(true)
    try {
      const d = await getApplicantFullDetail(profileId)
      setDetail(d)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Registration Approval</h1>
        <p className="mt-1 text-sm text-slate-500">Review applicants awaiting referee verification or final approval.</p>
      </FadeIn>

      <FadeIn delay={50}>
        <Tabs
          tabs={[
            { value: 'pending_referee_verification', label: 'Pending Referee' },
            { value: 'pending_admin_approval', label: 'Pending Admin' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </FadeIn>

      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load applicants." />
      ) : (applicants ?? []).length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nothing here" description="No applicants currently in this stage." />
      ) : (
        <div className="space-y-3">
          {applicants.map((a, i) => (
            <FadeIn key={a.id} delay={i * 30} className="card flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-sm font-semibold text-navy-700">
                  {a.profile_photo_url ? <img src={a.profile_photo_url} alt="" className="h-full w-full object-cover" /> : a.full_name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{a.full_name}</p>
                  <p className="truncate text-xs capitalize text-slate-400">{a.branch} {a.district ? `· ${a.district}` : ''}</p>
                  <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</p>
                </div>
              </div>
              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                {a.registration_type === 'family_head' && <Badge tone="gold">Family Head</Badge>}
                <button onClick={() => openDetail(a.id)} className="btn-outline">
                  <Eye size={15} /> Review
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      <ApplicantDetailModal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        detail={detail}
        loading={detailLoading}
        onDecided={refetch}
      />
    </div>
  )
}
