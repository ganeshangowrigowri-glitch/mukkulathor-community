import { useCallback } from 'react'
import { Award } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listActiveAchievers } from '../../services/achieversService'
import { Skeleton } from '../ui/Skeleton'
import FadeIn from '../ui/FadeIn'

export default function AchieversSection() {
  const { data: achievers, loading } = useSupabaseQuery(useCallback(() => listActiveAchievers(), []), [], { initialData: [] })

  if (!loading && (achievers ?? []).length === 0) return null

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="section-eyebrow">Community pride</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-navy-900">Our Achievers</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />)
            : achievers.map((a, i) => (
                <FadeIn key={a.id} delay={i * 30} className="overflow-hidden rounded-lg border border-slate-200 text-center">
                  <div className="aspect-square w-full bg-slate-100">
                    {a.image_url ? (
                      <img src={a.image_url} alt={a.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300"><Award size={32} /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-display text-sm font-semibold text-navy-900">{a.full_name}</h3>
                    <p className="mt-0.5 text-xs text-gold-600">{a.achievement}</p>
                    {a.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{a.description}</p>}
                  </div>
                </FadeIn>
              ))}
        </div>
      </div>
    </section>
  )
}
