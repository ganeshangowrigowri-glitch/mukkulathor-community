import { useCallback } from 'react'
import * as Icons from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listActiveServices } from '../../services/servicesService'
import { Skeleton } from '../ui/Skeleton'
import FadeIn from '../ui/FadeIn'

export default function ServicesSection() {
  const { data: services, loading } = useSupabaseQuery(useCallback(() => listActiveServices(), []), [], { initialData: [] })

  if (!loading && (services ?? []).length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="section-eyebrow">What we offer</p>
      <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-navy-900 sm:text-4xl">Our Services</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
          : services.map((s, i) => {
              const Icon = Icons[s.icon_name] || Icons.Sparkles
              return (
                <FadeIn key={s.id} delay={i * 30} className="card p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-navy-900">{s.title}</h3>
                  {s.description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.description}</p>}
                </FadeIn>
              )
            })}
      </div>
    </section>
  )
}