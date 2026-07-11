import { useCallback, useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Calendar as CalendarIcon, CalendarDays } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listPublishedEvents, getMyRsvpsForEvents, setRsvp, getRsvpSummary } from '../../services/eventService'
import FadeIn from '../../components/ui/FadeIn'
import { SkeletonGrid, SkeletonCard } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Tabs from '../../components/ui/Tabs'
import EventCard from '../../components/events/EventCard'
import MiniCalendar from '../../components/events/MiniCalendar'

export default function MemberEvents() {
  const { profile } = useAuth()
  const [view, setView] = useState('list')
  const [selectedDate, setSelectedDate] = useState(null)
  const [rsvps, setRsvps] = useState({})
  const [summaries, setSummaries] = useState({})

  const { data: events, loading, error, refetch } = useSupabaseQuery(useCallback(() => listPublishedEvents(), []), [], { initialData: [] })

  useEffect(() => {
    if (!profile?.id || !events?.length) return
    getMyRsvpsForEvents(profile.id, events.map((e) => e.id)).then(setRsvps)
    Promise.all(events.map((e) => getRsvpSummary(e.id).then((s) => [e.id, s]))).then((pairs) => {
      setSummaries(Object.fromEntries(pairs))
    })
  }, [profile?.id, events])

  const visibleEvents = useMemo(() => {
    if (!events) return []
    if (view === 'calendar' && selectedDate) {
      const key = selectedDate.toISOString().slice(0, 10)
      return events.filter((e) => e.event_date === key)
    }
    return events
  }, [events, view, selectedDate])

  async function handleRsvp(eventId, status) {
    if (!profile?.id) return
    try {
      await setRsvp(eventId, profile.id, status)
      setRsvps((prev) => ({ ...prev, [eventId]: status }))
      const updated = await getRsvpSummary(eventId)
      setSummaries((prev) => ({ ...prev, [eventId]: updated }))
      toast.success('RSVP updated')
    } catch (err) {
      toast.error(err.message || 'Could not update RSVP')
    }
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Events</h1>
          <p className="mt-1 text-sm text-slate-500">Community gatherings, workshops, and heritage drives.</p>
        </div>
        <Tabs
          tabs={[{ value: 'list', label: 'List' }, { value: 'calendar', label: 'Calendar' }]}
          active={view}
          onChange={(v) => { setView(v); setSelectedDate(null) }}
        />
      </FadeIn>

      {loading ? (
        <SkeletonGrid count={4} ItemComponent={SkeletonCard} />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load events." />
      ) : (events ?? []).length === 0 ? (
        <EmptyState icon={CalendarDays} title="No events yet" description="Check back soon for upcoming community events." />
      ) : (
        <div className={view === 'calendar' ? 'grid gap-6 lg:grid-cols-[320px_1fr]' : ''}>
          {view === 'calendar' && (
            <FadeIn delay={50}>
              <MiniCalendar events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </FadeIn>
          )}
          <div>
            {visibleEvents.length === 0 ? (
              <EmptyState icon={CalendarIcon} title="No events on this date" description="Pick another date with a marked dot, or switch to list view." />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {visibleEvents.map((e, i) => (
                  <FadeIn key={e.id} delay={i * 40}>
                    <EventCard event={e} rsvp={rsvps[e.id]} summary={summaries[e.id]} onRsvp={(status) => handleRsvp(e.id, status)} />
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
