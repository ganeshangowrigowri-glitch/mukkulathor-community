import { useCallback, useState } from 'react'
import { Download } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { adminSearchProfiles, exportMembersCSV, downloadCSV } from '../../services/adminService'
import FadeIn from '../../components/ui/FadeIn'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import MemberFilterBar from '../../components/admin/MemberFilterBar'
import { REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_BADGE } from '../../lib/constants'

export default function ExportMembers() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('approved')
  const [branch, setBranch] = useState('all')

  const { data: results, loading, error, refetch } = useSupabaseQuery(
    useCallback(() => adminSearchProfiles({ query, status, branch }), [query, status, branch]),
    [query, status, branch],
    { initialData: [] }
  )

  async function handleExport() {
    const csv = await exportMembersCSV(results ?? [])
    downloadCSV(csv, `mukkulathor-members-${status}-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const columns = [
    { key: 'family_id', header: 'BY', render: (row) => <span className="font-mono text-xs">{row.family_id || '—'}</span> },
    { key: 'full_name', header: 'Name', primary: true, render: (row) => <span className="font-medium text-slate-800">{row.full_name}</span> },
    { key: 'great_grandfather_family_tree_name', header: 'Family Name', render: (row) => row.great_grandfather_family_tree_name || '—' },
    { key: 'gender', header: 'Gender', render: (row) => <span className="capitalize">{row.gender || '—'}</span> },
    { key: 'registration_status', header: 'Status', render: (row) => <Badge tone={REGISTRATION_STATUS_BADGE[row.registration_status]?.replace('badge-', '')}>{REGISTRATION_STATUS_LABELS[row.registration_status]}</Badge> },
    { key: 'branch', header: 'Kilai', render: (row) => <span className="capitalize">{row.branch || '—'}</span> },
    { key: 'title', header: 'Pattam', render: (row) => row.title || '—' },
    { key: 'kula_deivam', header: 'Kula deivam', render: (row) => row.kula_deivam || '—' },
    { key: 'kaval_deivam', header: 'Kaval deivam', render: (row) => row.kaval_deivam || '—' },
    { key: 'occupation', header: 'Professional', render: (row) => row.occupation || '—' },
    { key: 'qualifications', header: 'Qualification', render: (row) => (Array.isArray(row.qualifications) ? row.qualifications.join(', ') : row.qualifications) || '—' },
    { key: 'city', header: 'City', render: (row) => row.city || '—' },
    { key: 'district', header: 'District', render: (row) => row.district || '—' },
    { key: 'country', header: 'Country', render: (row) => row.country || '—' },
    { key: 'mobile', header: 'Contact No', render: (row) => row.mobile || '—' },
  ]

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Export Members</h1>
          <p className="mt-1 text-sm text-slate-500">Filter, preview, and download member records as CSV.</p>
        </div>
        <button onClick={handleExport} disabled={!results?.length} className="btn-gold w-full sm:w-auto">
          <Download size={15} /> Export {results?.length ?? 0} Record{results?.length !== 1 && 's'}
        </button>
      </FadeIn>

      <FadeIn delay={50}>
        <MemberFilterBar query={query} onQuery={setQuery} status={status} onStatus={setStatus} branch={branch} onBranch={setBranch} />
      </FadeIn>

      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load members." />
      ) : (results ?? []).length === 0 ? (
        <EmptyState title="No matching records" description="Adjust your filters to find members to export." />
      ) : (
        <FadeIn delay={100}>
          <DataTable columns={columns} data={results} searchable={false} pageSize={15} />
        </FadeIn>
      )}
    </div>
  )
}