import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pencil, Wrench } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listAllServices, createService, updateService, deleteService } from '../../services/servicesService'
import FadeIn from '../../components/ui/FadeIn'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Badge from '../../components/ui/Badge'

const BLANK = { title: '', description: '', icon_name: '', display_order: 0, is_active: true }

export default function ManageServices() {
  const { data: services, loading, error, refetch } = useSupabaseQuery(useCallback(() => listAllServices(), []), [], { initialData: [] })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditing(null)
    setForm(BLANK)
    setModalOpen(true)
  }

  function openEdit(service) {
    setEditing(service)
    setForm({
      title: service.title,
      description: service.description || '',
      icon_name: service.icon_name || '',
      display_order: service.display_order ?? 0,
      is_active: service.is_active,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateService(editing.id, form)
        toast.success('Service updated')
      } else {
        await createService(form)
        toast.success('Service added')
      }
      setModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not save service')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteService(deleteTarget.id)
      toast.success('Service deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not delete service')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Manage Services</h1>
          <p className="mt-1 text-sm text-slate-500">
            These appear automatically on the public website and member dashboard — no code changes needed.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary w-full sm:w-auto"><Plus size={15} /> Add Service</button>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load services." />
      ) : (services ?? []).length === 0 ? (
        <EmptyState icon={Wrench} title="No services yet" action={<button onClick={openCreate} className="btn-primary">Add Service</button>} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy-900">{s.title}</div>
                    {s.description && <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">{s.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{s.display_order}</td>
                  <td className="px-4 py-3">
                    <Badge tone={s.is_active ? 'green' : 'grey'}>{s.is_active ? 'Active' : 'Hidden'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-700" aria-label="Edit"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget(s)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit Service' : 'Add Service'}
        footer={<>
          <button className="btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input
            label="Icon name (optional)"
            hint="Any lucide-react icon name, e.g. ShieldCheck, HeartHandshake"
            value={form.icon_name}
            onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
          />
          <Input
            label="Display order"
            type="number"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
          />
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
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Service"
      />
    </div>
  )
}