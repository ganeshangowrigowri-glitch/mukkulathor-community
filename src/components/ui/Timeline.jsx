import { Check, Clock, X } from 'lucide-react'
import clsx from 'clsx'

/**
 * Vertical timeline for status histories (Membership Status page, RSVP
 * history, etc). steps: [{ title, description, timestamp, state }]
 * state: 'done' | 'current' | 'rejected' | 'upcoming'
 */
export default function Timeline({ steps = [] }) {
  return (
    <ol className="relative space-y-8 pl-2">
      {steps.map((step, idx) => (
        <li key={idx} className="relative pl-8">
          {idx !== steps.length - 1 && (
            <span
              className={clsx(
                'absolute left-[13px] top-7 h-[calc(100%-4px)] w-0.5',
                step.state === 'done' ? 'bg-navy-600' : 'bg-slate-200'
              )}
            />
          )}
          <span
            className={clsx(
              'absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2',
              step.state === 'done' && 'border-navy-600 bg-navy-600 text-white',
              step.state === 'current' && 'border-gold-500 bg-gold-50 text-gold-600',
              step.state === 'rejected' && 'border-red-500 bg-red-50 text-red-600',
              step.state === 'upcoming' && 'border-slate-200 bg-white text-slate-300'
            )}
          >
            {step.state === 'done' && <Check size={14} />}
            {step.state === 'current' && <Clock size={14} />}
            {step.state === 'rejected' && <X size={14} />}
          </span>
          <div>
            <p className={clsx('text-sm font-semibold', step.state === 'upcoming' ? 'text-slate-400' : 'text-navy-900')}>{step.title}</p>
            {step.description && <p className="mt-0.5 text-sm text-slate-500">{step.description}</p>}
            {step.timestamp && <p className="mt-1 text-xs text-slate-400">{step.timestamp}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
