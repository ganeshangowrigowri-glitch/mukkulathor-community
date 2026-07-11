import { useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { getBranchBreakdown, getMonthlyRegistrations, getStatusBreakdown } from '../../services/adminService'
import FadeIn from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { SkeletonCard } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import { REGISTRATION_STATUS_LABELS } from '../../lib/constants'

export default function Analytics() {
  const branchQuery = useSupabaseQuery(useCallback(() => getBranchBreakdown(), []), [], { initialData: [] })
  const trendQuery = useSupabaseQuery(useCallback(() => getMonthlyRegistrations(), []), [], { initialData: [] })
  const statusQuery = useSupabaseQuery(useCallback(() => getStatusBreakdown(), []), [], { initialData: [] })

  const funnelData = (statusQuery.data ?? []).map((s) => ({ stage: REGISTRATION_STATUS_LABELS[s.status] || s.status, count: s.count }))

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Deeper trends across branches, registration stages, and time.</p>
      </FadeIn>

      <FadeIn delay={50}>
        <Card>
          <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Approved Members by Branch</h3>
          {branchQuery.loading ? <SkeletonCard /> : branchQuery.error ? (
            <ErrorState onRetry={branchQuery.refetch} message="Couldn't load branch data." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchQuery.data} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e9ebee" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="branch" tick={{ fontSize: 12, textTransform: 'capitalize' }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#cda339" radius={[0, 4, 4, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </FadeIn>

      <FadeIn delay={100}>
        <Card>
          <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Registration Funnel</h3>
          {statusQuery.loading ? <SkeletonCard /> : statusQuery.error ? (
            <ErrorState onRetry={statusQuery.refetch} message="Couldn't load funnel data." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ebee" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#173d5c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </FadeIn>

      <FadeIn delay={150}>
        <Card>
          <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Registration Trend</h3>
          {trendQuery.loading ? <SkeletonCard /> : trendQuery.error ? (
            <ErrorState onRetry={trendQuery.refetch} message="Couldn't load trend data." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendQuery.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ebee" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Registrations" stroke="#cda339" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </FadeIn>
    </div>
  )
}
