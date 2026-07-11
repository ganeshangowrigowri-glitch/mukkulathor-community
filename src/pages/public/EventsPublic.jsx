import { useEffect, useState } from 'react'
import { CalendarDays, MapPin, Clock } from 'lucide-react'
import PageHero from '../../components/layout/PageHero'
import PageLoader from '../../components/ui/PageLoader'
import EmptyState from '../../components/ui/EmptyState'
import { listPublishedEvents } from '../../services/eventService'

export default function EventsPublic() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listPublishedEvents().then((data) => { setEvents(data); setLoading(false) })
  }, [])

  return (
    <div>
      <PageHero eyebrow="What's coming up" title="Community Events" description="Gatherings, workshops, and heritage drives across the community." />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <PageLoader />
        ) : events.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No upcoming events" description="Check back soon for new gatherings and announcements." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {events.map((e) => (
              <div key={e.id} className="card overflow-hidden p-0">
                <div className="flex items-center justify-between bg-navy-900 px-5 py-3 text-white">
                  <span className="font-mono text-xs uppercase tracking-wide text-gold-400">{e.category}</span>
                  <span className="text-sm font-semibold">
                    {new Date(e.event_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-navy-900">{e.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{e.description}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                    {e.start_time && <span className="flex items-center gap-1"><Clock size={13} /> {e.start_time}</span>}
                    {e.location && <span className="flex items-center gap-1"><MapPin size={13} /> {e.location}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
