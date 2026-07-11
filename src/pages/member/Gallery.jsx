import { useCallback, useState, useMemo } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listPublishedGallery } from '../../services/galleryService'
import FadeIn from '../../components/ui/FadeIn'
import { SkeletonGrid, Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Lightbox from '../../components/gallery/Lightbox'

function GallerySkeleton() {
  return <Skeleton className="aspect-square w-full rounded-lg" />
}

export default function Gallery() {
  const { data: items, loading, error, refetch } = useSupabaseQuery(useCallback(() => listPublishedGallery(), []), [], { initialData: [] })
  const [album, setAlbum] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const albums = useMemo(() => ['all', ...new Set((items ?? []).map((i) => i.album).filter(Boolean))], [items])
  const filtered = useMemo(() => (album === 'all' ? items ?? [] : (items ?? []).filter((i) => i.album === album)), [items, album])

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Gallery</h1>
        <p className="mt-1 text-sm text-slate-500">Photographs from community gatherings, milestones, and heritage events.</p>
      </FadeIn>

      {!loading && albums.length > 1 && (
        <FadeIn delay={50} className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {albums.map((a) => (
            <button
              key={a}
              onClick={() => setAlbum(a)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium capitalize transition-colors ${
                album === a ? 'bg-navy-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {a}
            </button>
          ))}
        </FadeIn>
      )}

      {loading ? (
        <SkeletonGrid count={8} ItemComponent={GallerySkeleton} cols="sm:grid-cols-3 lg:grid-cols-4" />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load the gallery." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No photos yet" description="Photos will appear here as the admin publishes them." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((g, i) => (
            <button
              key={g.id}
              onClick={() => setLightboxIndex(i)}
              className="group aspect-square overflow-hidden rounded-lg border border-slate-200"
              aria-label={`View ${g.title || 'photo'}`}
            >
              <img
                src={g.image_url}
                alt={g.title || ''}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox images={filtered} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
      )}
    </div>
  )
}
