import clsx from 'clsx'

export function Card({ children, className, ...props }) {
  return (
    <div className={clsx('card p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-xl font-semibold text-navy-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
