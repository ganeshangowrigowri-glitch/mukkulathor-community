import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, MailQuestion, Heart, Users, Send, ArrowRight } from 'lucide-react'
import { useSupabaseQuery } from '../../../hooks/useSupabaseQuery'
import { getMatrimonyDashboard } from '../../../services/matrimonyService'
import StatCard from '../../../components/ui/StatCard'
import { Card } from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { SkeletonCard } from '../../../components/ui/Skeleton'
import ErrorState from '../../../components/ui/ErrorState'

const STATUS = {
  published: { label: 'Published', tone: 'green' },
  hidden: { label: 'Hidden', tone: 'grey' },
  draft: { label: 'Draft', tone: 'amber' },
}

export default function MatrimonyDashboard() {
  const { data: d, loading, error, refetch } = useSupabaseQuery(useCallback(() => getMatrimonyDashboard(), []), [])

  if (loading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
  if (error) return <ErrorState message={error.message || "Couldn't load your matrimony dashboard."} onRetry={refetch} />

  const st = d?.my_status ? STATUS[d.my_status] : null

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BadgeCheck} tone="green" label="Profile status" value={st ? st.label : 'Not created'} delta={d?.member_code} />
        <StatCard icon={MailQuestion} tone="gold" label="Interests received" value={d?.inbound_pending ?? 0} delta="awaiting your reply" />
        <StatCard icon={Send} tone="navy" label="Interests sent" value={d?.outbound_pending ?? 0} delta="awaiting reply" />
        <StatCard icon={Heart} tone="red" label="Shortlisted by" value={d?.shortlisted_by ?? 0} delta="families (count only)" />
      </div>

      {!d?.my_status || d.my_status !== 'published' ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-navy-900">
                {d?.my_status ? 'Your matrimony profile is not published' : 'Create your matrimony profile'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Fill in your lineage and preferences, then publish. You can hide it at any time.
              </p>
            </div>
            <Link to="/member/matrimony/my-profile" className="btn-primary">Go to my profile <ArrowRight size={15} /></Link>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge tone="green">Published</Badge>
              <p className="text-sm text-slate-600">{d.accepted} accepted connection(s) · {d.shortlisted} shortlisted</p>
            </div>
            <div className="flex gap-2">
              <Link to="/member/matrimony/browse" className="btn-primary"><Users size={15} /> Browse profiles</Link>
              <Link to="/member/matrimony/requests" className="btn-outline">View requests</Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
