import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Full-screen image preview with keyboard navigation (Esc to close,
 * arrow keys to navigate) — accessible and touch-friendly (large tap
 * targets for prev/next/close on phones).
 */
export default function Lightbox({ images, index, onClose, onNavigate }) {
  const image = images[index]

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowRight') onNavigate((index + 1) % images.length)
    if (e.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length)
  }, [index, images.length, onClose, onNavigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!image) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-navy-950/95 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between p-4">
        <p className="truncate text-sm text-slate-300">{image.title}</p>
        <button onClick={onClose} aria-label="Close preview" className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10">
          <X size={20} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
        <button
          onClick={() => onNavigate((index - 1 + images.length) % images.length)}
          aria-label="Previous image"
          className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
        >
          <ChevronLeft size={22} />
        </button>
        <img src={image.image_url} alt={image.title || ''} className="max-h-[75vh] max-w-full rounded-lg object-contain" />
        <button
          onClick={() => onNavigate((index + 1) % images.length)}
          aria-label="Next image"
          className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
        >
          <ChevronRight size={22} />
        </button>
      </div>
      {image.description && <p className="px-4 pb-6 text-center text-sm text-slate-400">{image.description}</p>}
    </div>
  )
}
