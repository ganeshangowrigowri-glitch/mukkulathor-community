import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  User, GitBranch, Users, CalendarDays, Megaphone, Settings, ClipboardList,
  ArrowRight, MapPin, Clock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listFamilyMembers } from '../../services/familyService'
import { listDocuments } from '../../services/documentService'
import { listPublishedNotices } from '../../services/noticeService'
import { listPublishedEvents } from '../../services/eventService'
import { calculateProfileCompletion, getMissingFieldLabels } from '../../lib/profileCompletion'
import { REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_BADGE } from '../../lib/constants'
import FadeIn from '../../components/ui/FadeIn'
import ProgressRing from '../../components/ui/ProgressRing'
import Badge from '../../components/ui/Badge'
import { SkeletonGrid, SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import QuickActionCard from '../../components/dashboard/QuickActionCard'
import ServicesSection from '../../components/public/ServicesSection'
import SocietiesSection from '../../components/public/SocietiesSection'

export default function MemberDashboardOverview() {
  const { profile } = useAuth()
  const profileId = profile?.id

  const familyQuery = useSupabaseQuery(
    useCallback(() => (profileId ? listFamilyMembers(profileId) : Promise.resolve([])), [profileId]),
    [profileId],
    { initialData: [] }
  )
  const docsQuery = useSupabaseQuery(
    useCallback(() => (profileId ? listDocuments(profileId) : Promise.resolve([])), [profileId]),
    [profileId],
    { initialData: [] }
  )
  const noticesQuery = useSupabaseQuery(useCallback(() => listPublishedNotices(), []), [], { initialData: [] })
  const eventsQuery = useSupabaseQuery(useCallback(() => listPublishedEvents(), []), [], { initialData: [] })

  if (!profile) return <SkeletonGrid count={4} />

  const completion = calculateProfileCompletion(profile, {
    familyMembersCount: familyQuery.data?.length ?? 0,
    documentsCount: docsQuery.data?.length ?? 0,
  })
  const missing = getMissingFieldLabels(profile)

  const upcomingEvents = (eventsQuery.data ?? [])
    .filter((e) => new Date(e.event_date) >= new Date(new Date().toDateString()))
    .slice(0, 3)
  const recentNotices = (noticesQuery.data ?? []).slice(0, 4)

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900 sm:text-3xl">
            Welcome, {profile.full_name?.split(' ')[0] ?? 'Member'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening in your community account.</p>
        </div>
      </FadeIn>

      {/* Top row: status + profile completion */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FadeIn delay={50} className="card flex items-center justify-between p-5 lg:col-span-2">
          <div>
            <p className="text-sm text-slate-500">Membership Status</p>
            <div className="mt-2">
              <Badge tone={REGISTRATION_STATUS_BADGE[profile.registration_status]?.replace('badge-', '')}>
                {REGISTRATION_STATUS_LABELS[profile.registration_status]}
              </Badge>
            </div>
            {profile.family_id && (
              <p className="mt-3 font-mono text-xs text-slate-400">Family ID: {profile.family_id}</p>
            )}
            <Link to="/member/status" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-navy-700 hover:underline">
              View full status timeline <ArrowRight size={14} />
            </Link>
          </div>
          <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700 sm:flex">
            <ClipboardList size={26} />
          </div>
        </FadeIn>

        <FadeIn delay={100} className="card flex items-center gap-4 p-5">
          <ProgressRing percent={completion} label="complete" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy-900">Profile Completion</p>
            {missing.length > 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                Missing: {missing.slice(0, 2).join(', ')}{missing.length > 2 ? ` +${missing.length - 2} more` : ''}
              </p>
            ) : (
              <p className="mt-1 text-xs text-emerald-600">Your profile is complete!</p>
            )}
            <Link to="/member/edit-profile" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-navy-700 hover:underline">
              Complete profile <ArrowRight size={12} />
            </Link>
          </div>
        </FadeIn>
      </div>

      {/* Quick actions */}
      <FadeIn delay={150}>
        <h2 className="mb-3 font-display text-lg font-semibold text-navy-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard icon={User} label="Edit Profile" description="Update your personal details" to="/member/edit-profile" />
          <QuickActionCard icon={GitBranch} label="Family Tree" description="View your lineage visualization" to="/member/family-tree" />
          <QuickActionCard icon={Users} label="Family Members" description="Add or manage relatives" to="/member/family-members" />
          <QuickActionCard icon={Settings} label="Settings" description="Privacy & notification preferences" to="/member/settings" />
        </div>
      </FadeIn>

      {/* Family summary + Upcoming events */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={200} className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-navy-900">Family Summary</h3>
            <Link to="/member/family-members" className="text-xs font-medium text-navy-700 hover:underline">Manage</Link>
          </div>
          {familyQuery.loading ? (
            <SkeletonList count={3} />
          ) : familyQuery.error ? (
            <ErrorState onRetry={familyQuery.refetch} message="Couldn't load family members." />
          ) : familyQuery.data.length === 0 ? (
            <EmptyState icon={Users} title="No family members yet" description="Add relatives to begin building your family tree." action={
              <Link to="/member/family-members" className="btn-outline">Add Family Member</Link>
            } />
          ) : (
            <ul className="space-y-3">
              {familyQuery.data.slice(0, 4).map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50 text-sm font-semibold text-gold-700">
                    {m.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{m.full_name}</p>
                    <p className="truncate text-xs capitalize text-slate-400">{m.relation_type?.replace(/_/g, ' ')}</p>
                  </div>
                </li>
              ))}
              {familyQuery.data.length > 4 && (
                <li className="text-xs text-slate-400">+{familyQuery.data.length - 4} more</li>
              )}
            </ul>
          )}
        </FadeIn>

        <FadeIn delay={250} className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-navy-900">Upcoming Events</h3>
            <Link to="/member/events" className="text-xs font-medium text-navy-700 hover:underline">View all</Link>
          </div>
          {eventsQuery.loading ? (
            <SkeletonList count={3} />
          ) : eventsQuery.error ? (
            <ErrorState onRetry={eventsQuery.refetch} message="Couldn't load events." />
          ) : upcomingEvents.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No upcoming events" description="Check back soon for new community gatherings." />
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((e) => (
                <li key={e.id} className="flex gap-3 rounded-sm2 border border-slate-100 p-3">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-navy-900 text-white">
                    <span className="text-[10px] uppercase leading-none">
                      {new Date(e.event_date).toLocaleString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold leading-tight">{new Date(e.event_date).getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{e.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {e.start_time && <span className="flex items-center gap-1"><Clock size={11} />{e.start_time}</span>}
                      {e.location && <span className="flex min-w-0 items-center gap-1 truncate"><MapPin size={11} className="shrink-0" />{e.location}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </FadeIn>
      </div>

      {/* Recent notices */}
      <FadeIn delay={300} className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-900">Recent Notices</h3>
          <Link to="/member/notices" className="text-xs font-medium text-navy-700 hover:underline">View all</Link>
        </div>
        {noticesQuery.loading ? (
          <SkeletonList count={3} />
        ) : noticesQuery.error ? (
          <ErrorState onRetry={noticesQuery.refetch} message="Couldn't load notices." />
        ) : recentNotices.length === 0 ? (
          <EmptyState icon={Megaphone} title="No notices" description="Community announcements will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentNotices.map((n) => (
              <li key={n.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                {n.is_pinned && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-500" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </FadeIn>
    </div>
  )
}
