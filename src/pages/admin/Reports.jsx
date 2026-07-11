import { useCallback } from 'react'
import { Download, FileText } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { getDistrictBreakdown, getStatusBreakdown, listAllProfiles, downloadCSV, exportMembersCSV } from '../../services/adminService'
import FadeIn from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import { REGISTRATION_STATUS_LABELS } from '../../lib/constants'

export default function Reports() {
  const districtQuery = useSupabaseQuery(useCallback(() => getDistrictBreakdown(), []), [], { initialData: [] })
  const statusQuery = useSupabaseQuery(useCallback(() => getStatusBreakdown(), []), [], { initialData: [] })

  async function handleExportAll() {
    const all = await listAllProfiles()
    const csv = await exportMembersCSV(all)
    downloadCSV(csv, `mukkulathor-members-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Membership distribution across districts and registration stages.</p>
        </div>
        <button onClick={handleExportAll} className="btn-outline w-full sm:w-auto"><Download size={15} /> Export Full Report (CSV)</button>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={50}>
          <Card>
            <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Approved Members by District</h3>
            {districtQuery.loading ? <SkeletonList count={4} /> : districtQuery.error ? (
              <ErrorState onRetry={districtQuery.refetch} message="Couldn't load district report." />
            ) : (districtQuery.data ?? []).length === 0 ? (
              <EmptyState icon={FileText} title="No data yet" />
            ) : (
              <div className="space-y-2">
                {districtQuery.data.map((d) => (
                  <div key={d.district} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-700">{d.district}</span>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-navy-600" style={{ width: `${Math.min(100, (d.count / districtQuery.data[0].count) * 100)}%` }} />
                      </div>
                      <span className="w-6 shrink-0 text-right text-xs font-medium text-slate-500">{d.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </FadeIn>

        <FadeIn delay={100}>
          <Card>
            <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Members by Registration Stage</h3>
            {statusQuery.loading ? <SkeletonList count={4} /> : statusQuery.error ? (
              <ErrorState onRetry={statusQuery.refetch} message="Couldn't load status report." />
            ) : (
              <div className="space-y-2">
                {statusQuery.data.map((s) => (
                  <div key={s.status} className="flex items-center justify-between rounded-sm2 bg-slate-50 px-3 py-2.5 text-sm">
                    <span className="text-slate-700">{REGISTRATION_STATUS_LABELS[s.status] || s.status}</span>
                    <span className="font-semibold text-navy-900">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
