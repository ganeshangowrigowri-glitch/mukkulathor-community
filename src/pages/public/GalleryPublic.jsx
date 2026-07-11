import { useEffect, useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import PageHero from '../../components/layout/PageHero'
import PageLoader from '../../components/ui/PageLoader'
import EmptyState from '../../components/ui/EmptyState'
import { listPublishedGallery } from '../../services/galleryService'

export default function GalleryPublic() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listPublishedGallery().then((data) => { setItems(data); setLoading(false) })
  }, [])

  return (
    <div>
      <PageHero eyebrow="Moments" title="Community Gallery" description="Photographs from gatherings, milestones, and heritage events." />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <PageLoader />
        ) : items.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No photos yet" description="The gallery will fill up as the admin publishes event photos." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((g) => (
              <figure key={g.id} className="group overflow-hidden rounded-lg border border-slate-200">
                <img src={g.image_url} alt={g.title || 'Community photo'} className="h-44 w-full object-cover transition-transform group-hover:scale-105" />
                {g.title && <figcaption className="px-3 py-2 text-xs text-slate-500">{g.title}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
