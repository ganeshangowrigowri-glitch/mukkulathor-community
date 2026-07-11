import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import MemberNode from './MemberNode'

/**
 * One expandable/collapsible generation band in the Family Tree. Renders as
 * a vertically-stacked accordion — deliberately NOT a wide horizontal
 * org-chart, since that breaks down badly on phone screens. Each generation
 * is its own touch-friendly disclosure section.
 */
export default function GenerationGroup({ label, level, members, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
      >
        <div className="flex items-center gap-3">
          <span className={clsx(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            level === 0 ? 'bg-gold-500 text-navy-900' : 'bg-navy-50 text-navy-700'
          )}>
            {members.length}
          </span>
          <span className="font-display text-base font-semibold text-navy-900">{label}</span>
        </div>
        <ChevronDown size={18} className={clsx('shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      <div className={clsx('grid transition-all duration-300', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
            {members.map((m) => <MemberNode key={m.id} member={m} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
