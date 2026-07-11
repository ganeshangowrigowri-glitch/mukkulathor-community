import { useCallback, useState, useMemo } from 'react'
import { Search, Megaphone, Pin } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listPublishedNotices } from '../../services/noticeService'
import FadeIn from '../../components/ui/FadeIn'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import { format } from 'date-fns'

export default function Notices() {
  const { data: notices, loading, error, refetch } = useSupabaseQuery(useCallback(() => listPublishedNotices(), []), [], { initialData: [] })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const categories = useMemo(() => ['all', ...new Set((notices ?? []).map((n) => n.category).filter(Boolean))], [notices])

  const filtered = useMemo(() => {
    return (notices ?? []).filter((n) => {
      const matchesQuery = !query || n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'all' || n.category === category
      return matchesQuery && matchesCategory
    })
  }, [notices, query, category])

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Notices</h1>
        <p className="mt-1 text-sm text-slate-500">Announcements and updates from the community office.</p>
      </FadeIn>

      <FadeIn delay={50} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notices…" className="input-field pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium capitalize transition-colors ${
                category === c ? 'bg-navy-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FadeIn>

      {loading ? (
        <SkeletonList count={4} />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load notices." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="No notices found" description="Try a different search term or category." />
      ) : (
        <div className="space-y-3">
          {filtered.map((n, i) => (
            <FadeIn key={n.id} delay={i * 30} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {n.is_pinned && <Pin size={13} className="shrink-0 text-gold-600" />}
                    <h3 className="font-display text-base font-semibold text-navy-900">{n.title}</h3>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-slate-600">{n.content}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">{n.category}</span>
              </div>
              <p className="mt-3 text-xs text-slate-400">{n.published_at && format(new Date(n.published_at), 'dd MMM yyyy')}</p>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  )
}
