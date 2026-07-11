import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths,
} from 'date-fns'
import clsx from 'clsx'

/**
 * Compact month calendar — used as the "calendar view" toggle for Events.
 * Mobile-safe: 7-column grid with small touch-friendly day cells, no
 * horizontal scroll at any width.
 */
export default function MiniCalendar({ events = [], selectedDate, onSelectDate }) {
  const [month, setMonth] = useState(selectedDate || new Date())

  const eventDates = new Set(events.map((e) => e.event_date))

  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)

  const days = []
  let day = gridStart
  while (day <= gridEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setMonth(subMonths(month, 1))} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <span className="font-display text-sm font-semibold text-navy-900">{format(month, 'MMMM yyyy')}</span>
        <button onClick={() => setMonth(addMonths(month, 1))} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd')
          const hasEvent = eventDates.has(key)
          const inMonth = isSameMonth(d, month)
          const isSelected = selectedDate && isSameDay(d, selectedDate)
          return (
            <button
              key={key}
              onClick={() => onSelectDate(hasEvent ? d : null)}
              className={clsx(
                'relative flex aspect-square items-center justify-center rounded-md text-xs',
                !inMonth && 'text-slate-300',
                inMonth && !isSelected && 'text-slate-700 hover:bg-slate-100',
                isSelected && 'bg-navy-700 text-white'
              )}
            >
              {d.getDate()}
              {hasEvent && <span className={clsx('absolute bottom-0.5 h-1 w-1 rounded-full', isSelected ? 'bg-gold-300' : 'bg-gold-500')} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
