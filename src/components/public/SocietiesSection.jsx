import { useCallback } from 'react'
import { Users2, ExternalLink } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listActiveSocieties } from '../../services/societiesService'
import { Skeleton } from '../ui/Skeleton'
import FadeIn from '../ui/FadeIn'

/**
 * `variant="public"` renders the full section wrapper (used on the Home page).
 * `variant="member"` renders just the grid, so it can sit inside a dashboard card.
 */
export default function SocietiesSection({ variant = 'public' }) {
  const { data: societies, loading } = useSupabaseQuery(useCallback(() => listActiveSocieties(), []), [], { initialData: [] })

  if (!loading && (societies ?? []).length === 0) return null

  const grid = (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />)
        : societies.map((s, i) => (
            <FadeIn key={s.id} delay={i * 30} className="overflow-hidden rounded-lg border border-slate-200">
              <div className="aspect-[4/3] w-full bg-slate-100">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300"><Users2 size={28} /></div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-semibold text-navy-900">{s.name}</h3>
                {s.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{s.description}</p>}
                {s.website_url && (
                  <a href={s.website_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-navy-700 hover:underline">
                    Visit website <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </FadeIn>
          ))}
    </div>
  )

  if (variant === 'member') return grid

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="section-eyebrow">Beyond the registry</p>
      <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-navy-900">Connected Societies</h2>
      <div className="mt-10">{grid}</div>
    </section>
  )
}
