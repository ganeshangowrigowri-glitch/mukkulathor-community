import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { UserCog, Plus, Power, Pencil, Trash2 } from 'lucide-react'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import {
  listAllReferees, setRefereeActive, promoteToReferee, adminSearchProfiles,
  createReferee, updateReferee, deleteReferee,
} from '../../services/adminService'
import FadeIn from '../../components/ui/FadeIn'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { SkeletonList } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import FileUpload from '../../components/ui/FileUpload'

const BLANK_NEW_REFEREE = {
  full_name: '', username: '', password: '', email: '', mobile: '', designation: '', region: '',
  father_name: '', kulam: '', caste: '', gothram: '', occupation: '',
}

export default function ManageReferees() {
  const { data: referees, loading, error, refetch } = useSupabaseQuery(useCallback(() => listAllReferees(), []), [], { initialData: [] })

  const [togglingId, setTogglingId] = useState(null)

  // Promote existing member
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [candidates, setCandidates] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [designation, setDesignation] = useState('')
  const [region, setRegion] = useState('')
  const [promoting, setPromoting] = useState(false)

  // Create new referee from scratch
  const [createOpen, setCreateOpen] = useState(false)
  const [newRef, setNewRef] = useState(BLANK_NEW_REFEREE)
  const [newRefPhoto, setNewRefPhoto] = useState(null)
  const [creating, setCreating] = useState(false)

  // Edit existing referee
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editPhoto, setEditPhoto] = useState(null)
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function handleToggle(ref) {
    setTogglingId(ref.id)
    try {
      await setRefereeActive(ref.id, !ref.is_active)
      toast.success(ref.is_active ? 'Referee deactivated' : 'Referee activated')
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not update referee')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleSearch(q) {
    setSearch(q)
    if (q.length < 2) { setCandidates([]); return }
    setSearching(true)
    try {
      const results = await adminSearchProfiles({ query: q, status: 'approved' })
      setCandidates(results.filter((r) => !referees.some((ref) => ref.profile_id === r.id)))
    } finally {
      setSearching(false)
    }
  }

  async function handlePromote() {
    if (!selectedCandidate) return
    setPromoting(true)
    try {
      await promoteToReferee(selectedCandidate.id, designation, region)
      toast.success(`${selectedCandidate.full_name} is now a referee`)
      setPromoteOpen(false)
      setSelectedCandidate(null)
      setDesignation('')
      setRegion('')
      setSearch('')
      setCandidates([])
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not promote member')
    } finally {
      setPromoting(false)
    }
  }

  async function handleCreate() {
    if (!newRef.full_name || !newRef.username || !newRef.password || !newRef.email) {
      toast.error('Full name, username, password and email are all required')
      return
    }
    if (newRef.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setCreating(true)
    try {
      const result = await createReferee(newRef, newRefPhoto)
      toast.success(`Referee created — ID: ${result.referee_code}, username: ${result.username}`)
      setCreateOpen(false)
      setNewRef(BLANK_NEW_REFEREE)
      setNewRefPhoto(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not create referee')
    } finally {
      setCreating(false)
    }
  }

  function openEdit(ref) {
    setEditing(ref)
    setEditForm({
      full_name: ref.profiles?.full_name || '',
      mobile: ref.profiles?.mobile || '',
      notification_email: ref.profiles?.notification_email || '',
      designation: ref.designation || '',
      region: ref.region || '',
      father_name: ref.father_name || '',
      kulam: ref.kulam || '',
      caste: ref.caste || '',
      gothram: ref.gothram || '',
      occupation: ref.occupation || '',
    })
    setEditPhoto(null)
  }

  async function handleSaveEdit() {
    setSaving(true)
    try {
      await updateReferee(
        editing.id,
        editing.profile_id,
        {
          profileUpdates: {
            full_name: editForm.full_name,
            mobile: editForm.mobile,
            notification_email: editForm.notification_email,
          },
          refereeUpdates: {
            designation: editForm.designation,
            region: editForm.region,
            father_name: editForm.father_name,
            kulam: editForm.kulam,
            caste: editForm.caste,
            gothram: editForm.gothram,
            occupation: editForm.occupation,
          },
        },
        editPhoto
      )
      toast.success('Referee updated')
      setEditing(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not update referee')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteReferee(deleteTarget.profile_id)
      toast.success('Referee deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not delete referee')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'referee_code', header: 'Referee ID', sortable: false,
      render: (row) => <span className="font-mono text-xs text-slate-500">{row.referee_code || '—'}</span>,
    },
    {
      key: 'full_name', header: 'Referee', sortable: false, primary: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.profile_image_url ? (
            <img src={row.profile_image_url} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-navy-100" />
          )}
          <div>
            <div className="font-medium text-slate-800">{row.profiles?.full_name}</div>
            <div className="text-xs text-slate-400">{row.profiles?.username}</div>
          </div>
        </div>
      ),
    },
    { key: 'designation', header: 'Designation', render: (row) => row.designation || '—' },
    { key: 'region', header: 'Place', render: (row) => row.region || '—' },
    { key: 'is_active', header: 'Status', render: (row) => <Badge tone={row.is_active ? 'green' : 'grey'}>{row.is_active ? 'Active' : 'Inactive'}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Referee Management</h1>
          <p className="mt-1 text-sm text-slate-500">Add, edit, and manage referees who verify new applicants.</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button onClick={() => setCreateOpen(true)} className="btn-primary w-full sm:w-auto">
            <Plus size={15} /> Create New Referee
          </button>
          <button onClick={() => setPromoteOpen(true)} className="btn-outline w-full sm:w-auto">
            Promote Member
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <SkeletonList count={4} />
      ) : error ? (
        <ErrorState onRetry={refetch} message="Couldn't load referees." />
      ) : (referees ?? []).length === 0 ? (
        <EmptyState icon={UserCog} title="No referees yet" description="Create a referee or promote an approved member to begin verifying new registrations." action={<button onClick={() => setCreateOpen(true)} className="btn-primary">Create New Referee</button>} />
      ) : (
        <FadeIn delay={50}>
          <DataTable
            columns={columns}
            data={referees}
            actions={(row) => (
              <div className="flex items-center justify-end gap-1.5">
                <button onClick={() => openEdit(row)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-700" aria-label="Edit">
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleToggle(row)}
                  disabled={togglingId === row.id}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${row.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                >
                  <Power size={12} /> {row.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => setDeleteTarget(row)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          />
        </FadeIn>
      )}

      {/* Promote existing member */}
      <Modal
        open={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        title="Promote Member to Referee"
        footer={
          <>
            <button className="btn-outline" onClick={() => setPromoteOpen(false)} disabled={promoting}>Cancel</button>
            <button className="btn-primary" onClick={handlePromote} disabled={!selectedCandidate || promoting}>{promoting ? 'Promoting…' : 'Promote'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Search approved members" placeholder="Type a name…" value={search} onChange={(e) => handleSearch(e.target.value)} />
          {searching && <p className="text-xs text-slate-400">Searching…</p>}
          {candidates.length > 0 && (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-sm2 border border-slate-200 p-2">
              {candidates.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCandidate(c)}
                  className={`flex w-full items-center justify-between rounded-sm2 px-3 py-2 text-left text-sm ${selectedCandidate?.id === c.id ? 'bg-navy-50 text-navy-800' : 'hover:bg-slate-50'}`}
                >
                  <span>{c.full_name}</span>
                  <span className="text-xs capitalize text-slate-400">{c.branch}</span>
                </button>
              ))}
            </div>
          )}
          {selectedCandidate && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Designation" placeholder="e.g. Village Elder" value={designation} onChange={(e) => setDesignation(e.target.value)} />
              <Input label="Place" placeholder="e.g. Madurai" value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
          )}
        </div>
      </Modal>

      {/* Create new referee from scratch */}
      <Modal
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        title="Create New Referee"
        footer={
          <>
            <button className="btn-outline" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</button>
            <button className="btn-primary" onClick={handleCreate} disabled={creating}>{creating ? 'Creating…' : 'Create & Assign ID'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <FileUpload label="Profile Photo (optional)" accept="image/*" onFiles={setNewRefPhoto} hint="JPG, PNG, or WebP up to 5MB" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Full Name" required value={newRef.full_name} onChange={(e) => setNewRef({ ...newRef, full_name: e.target.value })} />
            <Input label="Username" required hint="Used to log in — letters, numbers, dots, dashes" value={newRef.username} onChange={(e) => setNewRef({ ...newRef, username: e.target.value })} />
            <Input label="Password" type="password" required hint="At least 8 characters" value={newRef.password} onChange={(e) => setNewRef({ ...newRef, password: e.target.value })} />
            <Input label="Email Address" type="email" required hint="For notifications only — not used to log in" value={newRef.email} onChange={(e) => setNewRef({ ...newRef, email: e.target.value })} />
            <Input label="Contact Number" value={newRef.mobile} onChange={(e) => setNewRef({ ...newRef, mobile: e.target.value })} />
            <Input label="Place" placeholder="e.g. Colombo" value={newRef.region} onChange={(e) => setNewRef({ ...newRef, region: e.target.value })} />
            <Input label="Designation" placeholder="e.g. Village Elder" value={newRef.designation} onChange={(e) => setNewRef({ ...newRef, designation: e.target.value })} />
          </div>

          <p className="pt-1 text-xs font-medium uppercase tracking-wide text-slate-400">Optional personal details</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Father's Name" value={newRef.father_name} onChange={(e) => setNewRef({ ...newRef, father_name: e.target.value })} />
            <Input label="Kulam" value={newRef.kulam} onChange={(e) => setNewRef({ ...newRef, kulam: e.target.value })} />
            <Input label="Caste" value={newRef.caste} onChange={(e) => setNewRef({ ...newRef, caste: e.target.value })} />
            <Input label="Gothram" value={newRef.gothram} onChange={(e) => setNewRef({ ...newRef, gothram: e.target.value })} />
            <Input label="Occupation" value={newRef.occupation} onChange={(e) => setNewRef({ ...newRef, occupation: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* Edit referee */}
      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title={`Edit Referee — ${editing?.referee_code || ''}`}
        footer={
          <>
            <button className="btn-outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </>
        }
      >
        {editForm && (
          <div className="space-y-4">
            <FileUpload label="Replace photo (optional)" accept="image/*" onFiles={setEditPhoto} hint="JPG, PNG, or WebP up to 5MB" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Full Name" required value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
              <Input label="Contact Number" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} />
              <Input label="Email Address" type="email" value={editForm.notification_email} onChange={(e) => setEditForm({ ...editForm, notification_email: e.target.value })} />
              <Input label="Place" value={editForm.region} onChange={(e) => setEditForm({ ...editForm, region: e.target.value })} />
              <Input label="Designation" value={editForm.designation} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} />
            </div>
            <p className="pt-1 text-xs font-medium uppercase tracking-wide text-slate-400">Optional personal details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Father's Name" value={editForm.father_name} onChange={(e) => setEditForm({ ...editForm, father_name: e.target.value })} />
              <Input label="Kulam" value={editForm.kulam} onChange={(e) => setEditForm({ ...editForm, kulam: e.target.value })} />
              <Input label="Caste" value={editForm.caste} onChange={(e) => setEditForm({ ...editForm, caste: e.target.value })} />
              <Input label="Gothram" value={editForm.gothram} onChange={(e) => setEditForm({ ...editForm, gothram: e.target.value })} />
              <Input label="Occupation" value={editForm.occupation} onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Referee"
        description={`This permanently deletes ${deleteTarget?.profiles?.full_name}'s login and all their referee records. This cannot be undone.`}
        confirmLabel="Delete Referee"
      />
    </div>
  )
}