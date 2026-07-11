import { Check } from 'lucide-react'
import clsx from 'clsx'

export default function StepIndicator({ steps, current }) {
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-y-3">
      {steps.map((step, idx) => {
        const stepNum = idx + 1
        const isDone = stepNum < current
        const isActive = stepNum === current
        return (
          <li key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  isDone && 'bg-navy-700 text-white',
                  isActive && 'bg-gold-500 text-navy-900',
                  !isDone && !isActive && 'bg-slate-100 text-slate-400'
                )}
              >
                {isDone ? <Check size={15} /> : stepNum}
              </span>
              <span className={clsx('hidden text-sm font-medium sm:inline', isActive ? 'text-navy-900' : 'text-slate-400')}>
                {step}
              </span>
            </div>
            {stepNum !== steps.length && <span className="mx-3 h-px w-6 bg-slate-200 sm:w-10" />}
          </li>
        )
      })}
    </ol>
  )
}
