import { useState, useCallback } from 'react'
import { Search, Eye } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { adminSearchProfiles, getApplicantFullDetail } from '../../services/adminService'
import FadeIn from '../../components/ui/FadeIn'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import MemberFilterBar from '../../components/admin/MemberFilterBar'
import ApplicantDetailModal from '../../components/admin/ApplicantDetailModal'
import { REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_BADGE } from '../../lib/constants'

export default function SearchMembers() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [branch, setBranch] = useState('all')

  const { data: results, loading, error, refetch } = useSupabaseQuery(
    useCallback(() => adminSearchProfiles({ query, status, branch }), [query, status, branch]),
    [query, status, branch],
    { initialData: [] }
  )

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  async function openDetail(id) {
    setSelectedId(id)
    setDetail(null)
    setDetailLoading(true)
    try { setDetail(await getApplicantFullDetail(id)) } finally { setDetailLoading(false) }
  }

  const columns = [
    {
      key: 'full_name', header: 'Name', sortable: true, primary: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-xs font-semibold text-navy-700">
            {row.profile_photo_url ? <img src={row.profile_photo_url} alt="" className="h-full w-full object-cover" /> : row.full_name?.[0]?.toUpperCase()}
          </div>
          <span className="font-medium text-slate-800">{row.full_name}</span>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (row) => row.email || '—' },
    { key: 'mobile', header: 'Mobile', render: (row) => row.mobile || '—' },
    { key: 'branch', header: 'Branch', render: (row) => <span className="capitalize">{row.branch || '—'}</span> },
    { key: 'registration_status', header: 'Status', render: (row) => <Badge tone={REGISTRATION_STATUS_BADGE[row.registration_status]?.replace('badge-', '')}>{REGISTRATION_STATUS_LABELS[row.registration_status]}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Search Members</h1>
        <p className="mt-1 text-sm text-slate-500">Find any member across all registration statuses, branches, and regions.</p>
      </FadeIn>

      <FadeIn delay={50}>
        <MemberFilterBar query={query} onQuery={setQuery} status={status} onStatus={setStatus} branch={branch} onBranch={setBranch} />
      </FadeIn>

      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Search failed." />
      ) : (results ?? []).length === 0 ? (
        <EmptyState icon={Search} title="No matches" description="Try a different name, email, mobile number, or filter combination." />
      ) : (
        <FadeIn delay={100}>
          <DataTable
            columns={columns}
            data={results}
            searchable={false}
            pageSize={15}
            actions={(row) => (
              <button onClick={() => openDetail(row.id)} className="rounded-full p-2 text-slate-400 hover:bg-navy-50 hover:text-navy-700" aria-label="View">
                <Eye size={15} />
              </button>
            )}
          />
        </FadeIn>
      )}

      <ApplicantDetailModal open={!!selectedId} onClose={() => setSelectedId(null)} detail={detail} loading={detailLoading} onDecided={refetch} />
    </div>
  )
}
