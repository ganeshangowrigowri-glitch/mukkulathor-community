import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Megaphone, Pin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listAllNotices, createNotice, updateNotice, deleteNotice } from '../../services/noticeService'
import FadeIn from '../../components/ui/FadeIn'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'

const EMPTY = { title: '', content: '', category: 'General', is_pinned: false, is_published: true, expires_at: '' }

export default function ManageNotices() {
  const { profile } = useAuth()
  const { data: notices, loading, error, refetch } = useSupabaseQuery(useCallback(() => listAllNotices(), []), [], { initialData: [] })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function openAdd() { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  function openEdit(n) { setEditing(n); setForm({ ...n, expires_at: n.expires_at ? n.expires_at.slice(0, 10) : '' }); setModalOpen(true) }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, expires_at: form.expires_at || null, created_by: profile.id }
      delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.published_at

      if (editing) {
        await updateNotice(editing.id, payload)
        toast.success('Notice updated')
      } else {
        await createNotice({ ...payload, published_at: new Date().toISOString() })
        toast.success('Notice published')
      }
      await refetch()
      setModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Could not save notice')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteNotice(deleteTarget.id)
      toast.success('Notice deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not delete notice')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'title', header: 'Title', sortable: true, primary: true,
      render: (row) => (
        <span className="flex items-center gap-1.5 font-medium text-slate-800">
          {row.is_pinned && <Pin size={12} className="text-gold-600" />} {row.title}
        </span>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'is_published', header: 'Status', render: (row) => <Badge tone={row.is_published ? 'green' : 'grey'}>{row.is_published ? 'Published' : 'Draft'}</Badge> },
    { key: 'expires_at', header: 'Expires', render: (row) => row.expires_at ? new Date(row.expires_at).toLocaleDateString() : 'Never' },
  ]

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Manage Notices</h1>
          <p className="mt-1 text-sm text-slate-500">Publish announcements visible to members and the public.</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-full sm:w-auto"><Plus size={15} /> New Notice</button>
      </FadeIn>

      {loading ? <SkeletonList count={4} /> : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load notices." />
      ) : (notices ?? []).length === 0 ? (
        <EmptyState icon={Megaphone} title="No notices yet" action={<button onClick={openAdd} className="btn-primary">Create Notice</button>} />
      ) : (
        <FadeIn delay={50}>
          <DataTable
            columns={columns}
            data={notices}
            actions={(row) => (
              <div className="flex justify-end gap-1.5">
                <button onClick={() => openEdit(row)} className="rounded-full p-2 text-slate-400 hover:bg-navy-50 hover:text-navy-700" aria-label="Edit"><Pencil size={15} /></button>
                <button onClick={() => setDeleteTarget(row)} className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 size={15} /></button>
              </div>
            )}
          />
        </FadeIn>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit Notice' : 'New Notice'}
        size="lg"
        footer={<>
          <button className="btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Notice'}</button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Content" required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Category" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input type="date" label="Expires On (optional)" value={form.expires_at || ''} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" className="h-4 w-4 accent-navy-700" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} />
              Pin to top
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" className="h-4 w-4 accent-navy-700" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
              Published
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Notice"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Notice"
      />
    </div>
  )
}
