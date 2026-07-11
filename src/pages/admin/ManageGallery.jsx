import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listAllGallery, uploadGalleryImage, deleteGalleryItem } from '../../services/galleryService'
import FadeIn from '../../components/ui/FadeIn'
import { SkeletonGrid, Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import FileUpload from '../../components/ui/FileUpload'

function GallerySkeleton() {
  return <Skeleton className="aspect-square w-full rounded-lg" />
}

export default function ManageGallery() {
  const { profile } = useAuth()
  const { data: items, loading, error, refetch } = useSupabaseQuery(useCallback(() => listAllGallery(), []), [], { initialData: [] })

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', album: 'General' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function handleUpload() {
    if (!file) {
      toast.error('Please choose an image')
      return
    }
    setUploading(true)
    try {
      await uploadGalleryImage(file, form, profile.id)
      toast.success('Photo published to gallery')
      setModalOpen(false)
      setForm({ title: '', description: '', album: 'General' })
      setFile(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not upload image')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteGalleryItem(deleteTarget.id)
      toast.success('Photo removed')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not delete photo')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Manage Gallery</h1>
          <p className="mt-1 text-sm text-slate-500">Publish photos from community events and milestones.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary w-full sm:w-auto"><Plus size={15} /> Upload Photo</button>
      </FadeIn>

      {loading ? (
        <SkeletonGrid count={8} ItemComponent={GallerySkeleton} cols="sm:grid-cols-3 lg:grid-cols-4" />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load gallery." />
      ) : (items ?? []).length === 0 ? (
        <EmptyState icon={ImageIcon} title="No photos yet" action={<button onClick={() => setModalOpen(true)} className="btn-primary">Upload Photo</button>} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((g, i) => (
            <FadeIn key={g.id} delay={i * 20} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
              <img src={g.image_url} alt={g.title || ''} loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="truncate text-xs text-white">{g.title}</span>
                <button onClick={() => setDeleteTarget(g)} className="rounded-full bg-white/90 p-1.5 text-red-600 hover:bg-white" aria-label="Delete photo">
                  <Trash2 size={13} />
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !uploading && setModalOpen(false)}
        title="Upload Photo"
        footer={<>
          <button className="btn-outline" onClick={() => setModalOpen(false)} disabled={uploading}>Cancel</button>
          <button className="btn-primary" onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading…' : 'Publish'}</button>
        </>}
      >
        <div className="space-y-4">
          <FileUpload label="Image" accept="image/*" onFiles={setFile} hint="JPG, PNG, or WebP up to 8MB" />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Album" value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} placeholder="e.g. Annual Gathering 2026" />
          <Textarea label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Photo"
        description="Are you sure you want to remove this photo from the gallery?"
        confirmLabel="Delete Photo"
      />
    </div>
  )
}
