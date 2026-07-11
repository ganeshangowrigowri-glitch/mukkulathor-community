import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pencil, Award } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listAllAchievers, createAchiever, updateAchiever, deleteAchiever } from '../../services/achieversService'
import FadeIn from '../../components/ui/FadeIn'
import { SkeletonGrid, Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import FileUpload from '../../components/ui/FileUpload'
import Badge from '../../components/ui/Badge'

const BLANK = { full_name: '', achievement: '', description: '', display_order: 0, is_active: true }

function AchieverSkeleton() {
  return <Skeleton className="aspect-[3/4] w-full rounded-lg" />
}

export default function ManageAchievers() {
  const { data: achievers, loading, error, refetch } = useSupabaseQuery(useCallback(() => listAllAchievers(), []), [], { initialData: [] })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditing(null)
    setForm(BLANK)
    setFile(null)
    setModalOpen(true)
  }

  function openEdit(a) {
    setEditing(a)
    setForm({
      full_name: a.full_name,
      achievement: a.achievement,
      description: a.description || '',
      display_order: a.display_order ?? 0,
      is_active: a.is_active,
    })
    setFile(null)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.full_name.trim() || !form.achievement.trim()) {
      toast.error('Full name and achievement are required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateAchiever(editing.id, form, file)
        toast.success('Achiever updated')
      } else {
        await createAchiever(form, file)
        toast.success('Achiever added')
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not save achiever')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteAchiever(deleteTarget.id)
      toast.success('Achiever removed')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not delete achiever')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Manage Achievers</h1>
          <p className="mt-1 text-sm text-slate-500">Shown in the "Our Achievers" section on the public website.</p>
        </div>
        <button onClick={openCreate} className="btn-primary w-full sm:w-auto"><Plus size={15} /> Add Achiever</button>
      </FadeIn>

      {loading ? (
        <SkeletonGrid count={4} ItemComponent={AchieverSkeleton} cols="sm:grid-cols-2 lg:grid-cols-4" />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load achievers." />
      ) : (achievers ?? []).length === 0 ? (
        <EmptyState icon={Award} title="No achievers yet" action={<button onClick={openCreate} className="btn-primary">Add Achiever</button>} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {achievers.map((a, i) => (
            <FadeIn key={a.id} delay={i * 20} className="card overflow-hidden">
              <div className="aspect-square w-full bg-slate-100">
                {a.image_url ? (
                  <img src={a.image_url} alt={a.full_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300"><Award size={32} /></div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-display text-sm font-semibold text-navy-900">{a.full_name}</h3>
                  {!a.is_active && <Badge tone="grey">Hidden</Badge>}
                </div>
                <p className="mt-0.5 truncate text-xs text-gold-600">{a.achievement}</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => openEdit(a)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-700" aria-label="Edit"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteTarget(a)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit Achiever' : 'Add Achiever'}
        footer={<>
          <button className="btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </>}
      >
        <div className="space-y-4">
          <FileUpload label={editing ? 'Replace photo (optional)' : 'Photo'} accept="image/*" onFiles={setFile} hint="JPG, PNG, or WebP up to 5MB" />
          <Input label="Full Name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Achievement" required placeholder="e.g. IAS Officer, 2025 batch" value={form.achievement} onChange={(e) => setForm({ ...form, achievement: e.target.value })} />
          <Textarea label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Display order" type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Visible on the website
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Achiever"
        description={`Are you sure you want to remove "${deleteTarget?.full_name}"?`}
        confirmLabel="Remove"
      />
    </div>
  )
}
