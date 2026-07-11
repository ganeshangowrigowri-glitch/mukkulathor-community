import clsx from 'clsx'

export default function StatCard({ icon: Icon, label, value, tone = 'navy', delta }) {
  const tones = {
    navy: 'bg-navy-50 text-navy-700',
    gold: 'bg-gold-50 text-gold-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <div className="card flex items-start gap-4 p-5">
      <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', tones[tone])}>
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-display text-2xl font-semibold text-navy-900">{value}</p>
        {delta && <p className="mt-0.5 text-xs text-slate-400">{delta}</p>}
      </div>
    </div>
  )
}
