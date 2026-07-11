import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Users, Clock, CheckCircle2, XCircle, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { getDashboardStats, getBranchBreakdown, getMonthlyRegistrations } from '../../services/adminService'
import FadeIn from '../../components/ui/FadeIn'
import StatCard from '../../components/ui/StatCard'
import { SkeletonGrid, SkeletonCard } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'

const BRANCH_COLORS = { kallar: '#173d5c', maravar: '#cda339', agamudayar: '#697180' }

export default function AdminDashboard() {
  const statsQuery = useSupabaseQuery(useCallback(() => getDashboardStats(), []), [])
  const branchQuery = useSupabaseQuery(useCallback(() => getBranchBreakdown(), []), [], { initialData: [] })
  const trendQuery = useSupabaseQuery(useCallback(() => getMonthlyRegistrations(), []), [], { initialData: [] })

  const stats = statsQuery.data

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900 sm:text-3xl">Dashboard Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Community-wide membership overview.</p>
        </div>
        <Link to="/admin/pending-registrations" className="btn-gold w-full sm:w-auto">
          Review Registrations <ArrowRight size={15} />
        </Link>
      </FadeIn>

      {statsQuery.loading ? (
        <SkeletonGrid count={6} ItemComponent={SkeletonCard} cols="sm:grid-cols-2 lg:grid-cols-3" />
      ) : statsQuery.error ? (
        <ErrorState onRetry={statsQuery.refetch} message="Couldn't load dashboard stats." />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <FadeIn delay={30}><StatCard icon={Users} label="Total Registrations" value={stats.total ?? 0} tone="navy" /></FadeIn>
          <FadeIn delay={60}><StatCard icon={Clock} label="Pending Referee" value={stats.pendingReferee ?? 0} tone="gold" /></FadeIn>
          <FadeIn delay={90}><StatCard icon={ShieldCheck} label="Pending Admin Approval" value={stats.pendingAdmin ?? 0} tone="gold" /></FadeIn>
          <FadeIn delay={120}><StatCard icon={CheckCircle2} label="Approved Members" value={stats.approved ?? 0} tone="green" /></FadeIn>
          <FadeIn delay={150}><StatCard icon={XCircle} label="Rejected" value={stats.rejected ?? 0} tone="red" /></FadeIn>
          <FadeIn delay={180}><StatCard icon={UserCheck} label="Active Referees" value={stats.referees ?? 0} tone="navy" /></FadeIn>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={200} className="card p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Members by Branch</h3>
          {branchQuery.loading ? (
            <SkeletonCard />
          ) : branchQuery.error ? (
            <ErrorState onRetry={branchQuery.refetch} message="Couldn't load branch breakdown." />
          ) : (branchQuery.data ?? []).every((b) => b.count === 0) ? (
            <EmptyState title="No approved members yet" description="Branch distribution will appear once members are approved." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={branchQuery.data} dataKey="count" nameKey="branch" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {branchQuery.data.map((entry) => <Cell key={entry.branch} fill={BRANCH_COLORS[entry.branch] || '#94a3b8'} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs">
                {branchQuery.data.map((b) => (
                  <span key={b.branch} className="flex items-center gap-1.5 capitalize text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BRANCH_COLORS[b.branch] }} />
                    {b.branch} ({b.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </FadeIn>

        <FadeIn delay={250} className="card p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Registrations Over Time</h3>
          {trendQuery.loading ? (
            <SkeletonCard />
          ) : trendQuery.error ? (
            <ErrorState onRetry={trendQuery.refetch} message="Couldn't load registration trend." />
          ) : (trendQuery.data ?? []).length === 0 ? (
            <EmptyState title="No data yet" description="Registration trends will appear as applications come in." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendQuery.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ebee" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#173d5c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  )
}
