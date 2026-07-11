import { useCallback, useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { format } from 'date-fns'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { getAuditLogs } from '../../services/adminService'
import FadeIn from '../../components/ui/FadeIn'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'

const ACTION_TONE = {
  APPROVE_MEMBER: 'green', REJECT_MEMBER: 'red', SUSPEND_MEMBER: 'red', REACTIVATE_MEMBER: 'green',
  REFEREE_RECOMMEND: 'green', REFEREE_REJECT: 'red', PROMOTE_REFEREE: 'navy',
}

export default function AuditLogs() {
  const { data: logs, loading, error, refetch } = useSupabaseQuery(useCallback(() => getAuditLogs(200), []), [], { initialData: [] })
  const [actionFilter, setActionFilter] = useState('all')

  const actions = useMemo(() => ['all', ...new Set((logs ?? []).map((l) => l.action))], [logs])
  const filtered = useMemo(() => (actionFilter === 'all' ? logs ?? [] : (logs ?? []).filter((l) => l.action === actionFilter)), [logs, actionFilter])

  const columns = [
    { key: 'created_at', header: 'Timestamp', sortable: true, render: (row) => format(new Date(row.created_at), 'dd MMM yyyy, h:mm a') },
    { key: 'action', header: 'Action', sortable: true, primary: true, render: (row) => <Badge tone={ACTION_TONE[row.action] || 'grey'}>{row.action.replace(/_/g, ' ')}</Badge> },
    { key: 'actor', header: 'Performed By', render: (row) => row.profiles?.full_name || 'System' },
    { key: 'entity_type', header: 'Entity', render: (row) => <span className="capitalize">{row.entity_type}</span> },
    { key: 'details', header: 'Details', render: (row) => <span className="max-w-xs truncate text-xs text-slate-400">{row.details ? JSON.stringify(row.details) : '—'}</span> },
  ]

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Complete history of administrative and referee actions.</p>
      </FadeIn>

      <FadeIn delay={50} className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {actions.map((a) => (
          <button
            key={a}
            onClick={() => setActionFilter(a)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${actionFilter === a ? 'bg-navy-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {a === 'all' ? 'All Actions' : a.replace(/_/g, ' ')}
          </button>
        ))}
      </FadeIn>

      {loading ? (
        <SkeletonList count={6} />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load audit logs." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={History} title="No log entries" description="Administrative actions will be recorded here." />
      ) : (
        <FadeIn delay={100}>
          <DataTable columns={columns} data={filtered} searchable pageSize={20} />
        </FadeIn>
      )}
    </div>
  )
}
