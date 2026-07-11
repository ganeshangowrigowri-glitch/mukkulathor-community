import { CalendarDays, MapPin, Clock, Check, HelpCircle, X } from 'lucide-react'
import clsx from 'clsx'

const RSVP_OPTIONS = [
  { value: 'going', label: 'Going', icon: Check, tone: 'emerald' },
  { value: 'interested', label: 'Interested', icon: HelpCircle, tone: 'amber' },
  { value: 'not_going', label: "Can't go", icon: X, tone: 'slate' },
]

export default function EventCard({ event, rsvp, onRsvp, summary }) {
  const isPast = new Date(event.event_date) < new Date(new Date().toDateString())

  return (
    <div className="card overflow-hidden p-0">
      {event.banner_url && (
        <img src={event.banner_url} alt={event.title} loading="lazy" className="h-36 w-full object-cover" />
      )}
      <div className="flex items-center justify-between bg-navy-900 px-5 py-3 text-white">
        <span className="font-mono text-xs uppercase tracking-wide text-gold-400">{event.category}</span>
        <span className="text-sm font-semibold">
          {new Date(event.event_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-navy-900">{event.title}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm text-slate-500">{event.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
          {event.start_time && <span className="flex items-center gap-1"><Clock size={13} /> {event.start_time}</span>}
          {event.location && <span className="flex items-center gap-1"><MapPin size={13} /> {event.location}</span>}
        </div>

        {summary && (
          <p className="mt-3 text-xs text-slate-400">
            {summary.going_count ?? 0} going · {summary.interested_count ?? 0} interested
          </p>
        )}

        {!isPast && onRsvp && (
          <div className="mt-4 flex flex-wrap gap-2">
            {RSVP_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const active = rsvp === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => onRsvp(opt.value)}
                  className={clsx(
                    'inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors',
                    active
                      ? opt.value === 'going' ? 'bg-emerald-600 text-white'
                        : opt.value === 'interested' ? 'bg-amber-500 text-white'
                        : 'bg-slate-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  <Icon size={13} /> {opt.label}
                </button>
              )
            })}
          </div>
        )}
        {isPast && <p className="mt-4 inline-flex items-center gap-1 text-xs text-slate-400"><CalendarDays size={12} /> Event has passed</p>}
      </div>
    </div>
  )
}
