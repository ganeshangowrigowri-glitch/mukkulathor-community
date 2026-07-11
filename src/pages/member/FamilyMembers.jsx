import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import {
  listFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember,
  uploadFamilyPhoto, rebuildFamilyTree,
} from '../../services/familyService'
import FadeIn from '../../components/ui/FadeIn'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import FileUpload from '../../components/ui/FileUpload'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { RELATION_TYPES, GENDERS, RELATION_LABELS } from '../../lib/constants'

const EMPTY_FORM = { relation_type: 'child', full_name: '', gender: 'male', dob: '', occupation: '', notes: '', is_living: true }

export default function FamilyMembers() {
  const { profile } = useAuth()
  const profileId = profile?.id

  const { data: members, loading, error, refetch } = useSupabaseQuery(
    useCallback(() => (profileId ? listFamilyMembers(profileId) : Promise.resolve([])), [profileId]),
    [profileId],
    { initialData: [] }
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [photoFile, setPhotoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setPhotoFile(null)
    setModalOpen(true)
  }

  function openEdit(member) {
    setEditing(member)
    setForm({ ...member, dob: member.dob || '' })
    setPhotoFile(null)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.full_name?.trim()) {
      toast.error('Full name is required')
      return
    }
    setSaving(true)
    try {
      let photoUrl = form.photo_url
      if (photoFile) photoUrl = await uploadFamilyPhoto(profileId, photoFile)

      const payload = { ...form, photo_url: photoUrl, dob: form.dob || null }
      delete payload.id
      delete payload.profile_id
      delete payload.created_at
      delete payload.updated_at

      if (editing) {
        await updateFamilyMember(editing.id, payload)
        toast.success('Family member updated')
      } else {
        await addFamilyMember(profileId, payload)
        toast.success('Family member added')
      }
      await rebuildFamilyTree(profileId)
      await refetch()
      setModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Could not save family member')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(member) {
    if (!window.confirm(`Remove ${member.full_name} from your family records?`)) return
    setDeletingId(member.id)
    try {
      await deleteFamilyMember(member.id)
      await rebuildFamilyTree(profileId)
      await refetch()
      toast.success('Family member removed')
    } catch (err) {
      toast.error(err.message || 'Could not remove family member')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      key: 'full_name', header: 'Name', sortable: true, primary: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-xs font-semibold text-navy-700">
            {row.photo_url ? <img src={row.photo_url} alt="" className="h-full w-full object-cover" /> : row.full_name?.[0]?.toUpperCase()}
          </div>
          <span className="font-medium text-slate-800">{row.full_name}</span>
        </div>
      ),
    },
    { key: 'relation_type', header: 'Relation', sortable: true, render: (row) => <Badge tone="navy">{RELATION_LABELS[row.relation_type]}</Badge> },
    { key: 'gender', header: 'Gender', render: (row) => <span className="capitalize">{row.gender || '—'}</span> },
    { key: 'dob', header: 'Date of Birth', render: (row) => row.dob || '—' },
    { key: 'occupation', header: 'Occupation', render: (row) => row.occupation || '—' },
  ]

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Family Members</h1>
          <p className="mt-1 text-sm text-slate-500">Add, edit, or remove relatives to keep your family tree accurate.</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-full sm:w-auto">
          <Plus size={15} /> Add Family Member
        </button>
      </FadeIn>

      <FadeIn delay={50}>
        {loading ? (
          <SkeletonList count={4} />
        ) : error ? (
          <ErrorState onRetry={refetch} message="Couldn't load family members." />
        ) : (members ?? []).length === 0 ? (
          <EmptyState icon={Users} title="No family members yet" description="Start by adding your parents, spouse, or children." action={<button onClick={openAdd} className="btn-primary">Add Family Member</button>} />
        ) : (
          <DataTable
            columns={columns}
            data={members}
            actions={(row) => (
              <div className="flex justify-end gap-1.5">
                <button onClick={() => openEdit(row)} className="rounded-full p-2 text-slate-400 hover:bg-navy-50 hover:text-navy-700" aria-label="Edit">
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(row)}
                  disabled={deletingId === row.id}
                  className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          />
        )}
      </FadeIn>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit Family Member' : 'Add Family Member'}
        footer={
          <>
            <button className="btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Relation" required options={RELATION_TYPES} value={form.relation_type} onChange={(e) => setForm({ ...form, relation_type: e.target.value })} />
            <Input label="Full Name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <Select label="Gender" options={GENDERS} value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
            <Input type="date" label="Date of Birth" value={form.dob || ''} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            <Input label="Occupation" value={form.occupation || ''} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
            <label className="flex items-center gap-2 pt-7 text-sm text-slate-600">
              <input type="checkbox" className="h-4 w-4 accent-navy-700" checked={form.is_living !== false} onChange={(e) => setForm({ ...form, is_living: e.target.checked })} />
              Currently living
            </label>
          </div>
          <Textarea label="Notes" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <FileUpload label="Photo (optional)" accept="image/*" onFiles={setPhotoFile} hint="JPG or PNG, up to 5MB" />
        </div>
      </Modal>
    </div>
  )
}
