import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Users, Eye, Ban, RotateCcw } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listAllProfiles, getApplicantFullDetail, suspendMember, reactivateMember } from '../../services/adminService'
import FadeIn from '../../components/ui/FadeIn'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Textarea from '../../components/ui/Textarea'
import ApplicantDetailModal from '../../components/admin/ApplicantDetailModal'
import { REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_BADGE } from '../../lib/constants'

export default function ManageMembers() {
  const { data: members, loading, error, refetch } = useSupabaseQuery(useCallback(() => listAllProfiles(), []), [], { initialData: [] })

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [suspendTarget, setSuspendTarget] = useState(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [suspending, setSuspending] = useState(false)
  const [reactivating, setReactivating] = useState(null)

  async function openDetail(profileId) {
    setSelectedId(profileId)
    setDetail(null)
    setDetailLoading(true)
    try {
      setDetail(await getApplicantFullDetail(profileId))
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleSuspend() {
    if (!suspendReason.trim()) {
      toast.error('Please provide a reason')
      return
    }
    setSuspending(true)
    try {
      await suspendMember(suspendTarget.id, suspendReason)
      toast.success(`${suspendTarget.full_name} suspended`)
      setSuspendTarget(null)
      setSuspendReason('')
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not suspend member')
    } finally {
      setSuspending(false)
    }
  }

  async function handleReactivate(member) {
    setReactivating(member.id)
    try {
      await reactivateMember(member.id)
      toast.success(`${member.full_name} reactivated`)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not reactivate member')
    } finally {
      setReactivating(null)
    }
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
    { key: 'family_id', header: 'Family ID', render: (row) => <span className="font-mono text-xs">{row.family_id || '—'}</span> },
    { key: 'branch', header: 'Branch', sortable: true, render: (row) => <span className="capitalize">{row.branch || '—'}</span> },
    { key: 'district', header: 'District', render: (row) => row.district || '—' },
    { key: 'registration_status', header: 'Status', sortable: true, render: (row) => <Badge tone={REGISTRATION_STATUS_BADGE[row.registration_status]?.replace('badge-', '')}>{REGISTRATION_STATUS_LABELS[row.registration_status]}</Badge> },
    { key: 'roles', header: 'Role', render: (row) => <span className="capitalize">{row.roles?.name ?? 'member'}</span> },
  ]

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Member Management</h1>
        <p className="mt-1 text-sm text-slate-500">View, suspend, or reactivate any registered member.</p>
      </FadeIn>

      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load members." />
      ) : (members ?? []).length === 0 ? (
        <EmptyState icon={Users} title="No members yet" />
      ) : (
        <FadeIn delay={50}>
          <DataTable
            columns={columns}
            data={members}
            pageSize={15}
            actions={(row) => (
              <div className="flex justify-end gap-1.5">
                <button onClick={() => openDetail(row.id)} className="rounded-full p-2 text-slate-400 hover:bg-navy-50 hover:text-navy-700" aria-label="View">
                  <Eye size={15} />
                </button>
                {row.registration_status === 'suspended' ? (
                  <button onClick={() => handleReactivate(row)} disabled={reactivating === row.id} className="rounded-full p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" aria-label="Reactivate">
                    <RotateCcw size={15} />
                  </button>
                ) : row.registration_status === 'approved' ? (
                  <button onClick={() => setSuspendTarget(row)} className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Suspend">
                    <Ban size={15} />
                  </button>
                ) : null}
              </div>
            )}
          />
        </FadeIn>
      )}

      <ApplicantDetailModal open={!!selectedId} onClose={() => setSelectedId(null)} detail={detail} loading={detailLoading} onDecided={refetch} />

      <Modal
        open={!!suspendTarget}
        onClose={() => !suspending && setSuspendTarget(null)}
        title={`Suspend ${suspendTarget?.full_name ?? ''}`}
        footer={
          <>
            <button className="btn-outline" onClick={() => setSuspendTarget(null)} disabled={suspending}>Cancel</button>
            <button className="btn-danger" onClick={handleSuspend} disabled={suspending}>{suspending ? 'Suspending…' : 'Suspend Member'}</button>
          </>
        }
        size="sm"
      >
        <Textarea label="Reason" required value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Why is this member being suspended?" />
      </Modal>
    </div>
  )
}
