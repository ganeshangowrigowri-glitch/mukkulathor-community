import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export default function QuickActionCard({ icon: Icon, label, description, to }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-navy-300 hover:shadow-card"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700 transition-colors group-hover:bg-navy-700 group-hover:text-white">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy-900">{label}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{description}</p>
      </div>
      <ArrowUpRight size={15} className="mt-1 shrink-0 text-slate-300 transition-colors group-hover:text-gold-500" />
    </Link>
  )
}
