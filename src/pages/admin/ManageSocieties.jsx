import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pencil, Users2 } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listAllSocieties, createSociety, updateSociety, deleteSociety } from '../../services/societiesService'
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

const BLANK = { name: '', description: '', website_url: '', contact_email: '', display_order: 0, is_active: true }

function SocietySkeleton() {
  return <Skeleton className="aspect-[4/3] w-full rounded-lg" />
}

export default function ManageSocieties() {
  const { data: societies, loading, error, refetch } = useSupabaseQuery(useCallback(() => listAllSocieties(), []), [], { initialData: [] })

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

  function openEdit(s) {
    setEditing(s)
    setForm({
      name: s.name,
      description: s.description || '',
      website_url: s.website_url || '',
      contact_email: s.contact_email || '',
      display_order: s.display_order ?? 0,
      is_active: s.is_active,
    })
    setFile(null)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Society name is required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateSociety(editing.id, form, file)
        toast.success('Society updated')
      } else {
        await createSociety(form, file)
        toast.success('Society added')
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not save society')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteSociety(deleteTarget.id)
      toast.success('Society removed')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not delete society')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Manage Connected Societies</h1>
          <p className="mt-1 text-sm text-slate-500">Shown on the public website and member dashboard.</p>
        </div>
        <button onClick={openCreate} className="btn-primary w-full sm:w-auto"><Plus size={15} /> Add Society</button>
      </FadeIn>

      {loading ? (
        <SkeletonGrid count={4} ItemComponent={SocietySkeleton} cols="sm:grid-cols-2 lg:grid-cols-3" />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load societies." />
      ) : (societies ?? []).length === 0 ? (
        <EmptyState icon={Users2} title="No societies yet" action={<button onClick={openCreate} className="btn-primary">Add Society</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {societies.map((s, i) => (
            <FadeIn key={s.id} delay={i * 20} className="card overflow-hidden">
              <div className="aspect-[4/3] w-full bg-slate-100">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300"><Users2 size={32} /></div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-display text-base font-semibold text-navy-900">{s.name}</h3>
                  {!s.is_active && <Badge tone="grey">Hidden</Badge>}
                </div>
                {s.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{s.description}</p>}
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => openEdit(s)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-700" aria-label="Edit"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteTarget(s)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit Society' : 'Add Society'}
        footer={<>
          <button className="btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </>}
      >
        <div className="space-y-4">
          <FileUpload label={editing ? 'Replace logo/photo (optional)' : 'Logo / Photo'} accept="image/*" onFiles={setFile} hint="JPG, PNG, or WebP up to 5MB" />
          <Input label="Society Name" required placeholder="e.g. Mukkulathor Youth Society" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Website (optional)" placeholder="https://..." value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
          <Input label="Contact Email (optional)" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
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
        title="Remove Society"
        description={`Are you sure you want to remove "${deleteTarget?.name}"?`}
        confirmLabel="Remove"
      />
    </div>
  )
}
