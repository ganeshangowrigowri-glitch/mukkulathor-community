import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { listAllEvents, createEvent, updateEvent, deleteEvent, uploadEventBanner } from '../../services/eventService'
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
import FileUpload from '../../components/ui/FileUpload'

const EMPTY = { title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', category: 'General', is_published: true }

export default function ManageEvents() {
  const { profile } = useAuth()
  const { data: events, loading, error, refetch } = useSupabaseQuery(useCallback(() => listAllEvents(), []), [], { initialData: [] })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [bannerFile, setBannerFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function openAdd() { setEditing(null); setForm(EMPTY); setBannerFile(null); setModalOpen(true) }
  function openEdit(ev) { setEditing(ev); setForm({ ...ev }); setBannerFile(null); setModalOpen(true) }

  async function handleSave() {
    if (!form.title.trim() || !form.event_date) {
      toast.error('Title and date are required')
      return
    }
    setSaving(true)
    try {
      let bannerUrl = form.banner_url
      if (bannerFile) bannerUrl = await uploadEventBanner(bannerFile)
      const payload = { ...form, banner_url: bannerUrl, created_by: profile.id }
      delete payload.id; delete payload.created_at; delete payload.updated_at

      if (editing) {
        await updateEvent(editing.id, payload)
        toast.success('Event updated')
      } else {
        await createEvent(payload)
        toast.success('Event created')
      }
      await refetch()
      setModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Could not save event')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteEvent(deleteTarget.id)
      toast.success('Event deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not delete event')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'title', header: 'Title', sortable: true, primary: true, render: (row) => <span className="font-medium text-slate-800">{row.title}</span> },
    { key: 'event_date', header: 'Date', sortable: true },
    { key: 'category', header: 'Category' },
    { key: 'location', header: 'Location', render: (row) => row.location || '—' },
    { key: 'is_published', header: 'Status', render: (row) => <Badge tone={row.is_published ? 'green' : 'grey'}>{row.is_published ? 'Published' : 'Draft'}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Manage Events</h1>
          <p className="mt-1 text-sm text-slate-500">Create and publish community gatherings and workshops.</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-full sm:w-auto"><Plus size={15} /> New Event</button>
      </FadeIn>

      {loading ? <SkeletonList count={4} /> : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load events." />
      ) : (events ?? []).length === 0 ? (
        <EmptyState icon={CalendarDays} title="No events yet" action={<button onClick={openAdd} className="btn-primary">Create Event</button>} />
      ) : (
        <FadeIn delay={50}>
          <DataTable
            columns={columns}
            data={events}
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
        title={editing ? 'Edit Event' : 'New Event'}
        size="lg"
        footer={<>
          <button className="btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Event'}</button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input type="date" label="Event Date" required value={form.event_date || ''} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            <Input type="time" label="Start Time" value={form.start_time || ''} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            <Input type="time" label="End Time" value={form.end_time || ''} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Location" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Input label="Category" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <FileUpload label="Event Banner (optional)" accept="image/*" onFiles={setBannerFile} hint="JPG or PNG, up to 8MB" />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" className="h-4 w-4 accent-navy-700" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Published (visible to members and public)
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Event"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Event"
      />
    </div>
  )
}
