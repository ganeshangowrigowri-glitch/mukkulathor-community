import clsx from 'clsx'

export function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-md bg-slate-200/80', className)} />
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={clsx('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }) {
  return (
    <div className={clsx('card space-y-4 p-5', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 4, ItemComponent = SkeletonCard, cols = 'sm:grid-cols-2 lg:grid-cols-4' }) {
  return (
    <div className={clsx('grid grid-cols-1 gap-4', cols)}>
      {Array.from({ length: count }).map((_, i) => <ItemComponent key={i} />)}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  )
}
