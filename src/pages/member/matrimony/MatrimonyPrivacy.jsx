import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useSupabaseQuery } from '../../../hooks/useSupabaseQuery'
import { getMyMatrimonyProfile, saveMyMatrimonyProfile, deleteMyMatrimonyProfile } from '../../../services/matrimonyService'
import { Card, CardHeader } from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Badge from '../../../components/ui/Badge'
import PageLoader from '../../../components/ui/PageLoader'
import ErrorState from '../../../components/ui/ErrorState'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published', desc: 'Approved members can find your profile card (no name, no contact).' },
  { value: 'hidden', label: 'Hidden', desc: 'Nobody can find you. Existing accepted connections keep working until revoked.' },
  { value: 'draft', label: 'Draft', desc: 'Not visible. Use while you are still editing.' },
]
const PHOTO_OPTIONS = [
  { value: 'after_accept', label: 'After I accept an interest', desc: 'Recommended — photo stays private until you accept.' },
  { value: 'members', label: 'All approved members', desc: 'Your photo appears on your profile card.' },
]

const SHARE_OPTIONS = [
  { key: 'share_contact', label: 'Contact details', desc: 'E-mail, WhatsApp, Facebook, address and city.' },
  { key: 'share_registration', label: 'Registration details', desc: 'Registration and approval dates, family ID, date of birth, blood group, birth place and workplace.' },
  { key: 'share_family', label: 'Family details', desc: 'Parents and grandparents, family members and your family tree.' },
]

function RadioRow({ name, value, current, onChange, label, desc, disabled }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${current === value ? 'border-navy-600 bg-navy-50' : 'border-slate-200'}`}>
      <input type="radio" name={name} className="mt-1 accent-navy-700" checked={current === value} disabled={disabled} onChange={() => onChange(value)} />
      <span>
        <span className="block text-sm font-semibold text-navy-900">{label}</span>
        <span className="block text-xs text-slate-500">{desc}</span>
      </span>
    </label>
  )
}

export default function MatrimonyPrivacy() {
  const { profile } = useAuth()
  const { data: row, loading, error, refetch } = useSupabaseQuery(
    useCallback(() => getMyMatrimonyProfile(profile.id), [profile.id]), [profile.id]
  )
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => { setPhone(row?.contact_phone ?? '') }, [row])

  async function update(fields, okMsg) {
    setBusy(true)
    try {
      await saveMyMatrimonyProfile(profile.id, fields)
      toast.success(okMsg)
      refetch()
    } catch (e) {
      toast.error(e.message || 'Could not update')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    try {
      await deleteMyMatrimonyProfile(profile.id)
      toast.success('Matrimony profile deleted')
      setConfirmDelete(false)
      refetch()
    } catch (e) {
      toast.error(e.message || 'Could not delete')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  if (!row) {
    return (
      <Card>
        <p className="text-sm text-slate-600">You haven't created a matrimony profile yet.</p>
        <Link to="/member/matrimony/my-profile" className="btn-primary mt-4">Create profile</Link>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Profile visibility" action={<Badge tone={row.status === 'published' ? 'green' : 'grey'}>{row.status}</Badge>} />
        <div className="space-y-2">
          {STATUS_OPTIONS.map((o) => (
            <RadioRow key={o.value} name="status" value={o.value} current={row.status} disabled={busy}
              label={o.label} desc={o.desc} onChange={(v) => update({ status: v }, `Profile is now ${v}`)} />
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">Publishing needs your gender and date of birth to be set on your member profile.</p>
      </Card>

      <Card>
        <CardHeader title="Who can see my photo" />
        <div className="space-y-2">
          {PHOTO_OPTIONS.map((o) => (
            <RadioRow key={o.value} name="photo" value={o.value} current={row.photo_visibility} disabled={busy}
              label={o.label} desc={o.desc} onChange={(v) => update({ photo_visibility: v }, 'Photo visibility updated')} />
          ))}
        </div>
      </Card>

            <Card>
        <CardHeader title="What I share after I accept an interest" subtitle="Nothing below is visible before you accept. Your contact number is always shared when you accept; choose what else the other member can see." />
        <div className="space-y-2">
          {SHARE_OPTIONS.map((o) => (
            <label key={o.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-navy-700"
                checked={row[o.key] !== false}
                disabled={busy}
                onChange={(e) => update({ [o.key]: e.target.checked }, 'Sharing preference saved')}
              />
              <span>
                <span className="block text-sm font-semibold text-navy-900">{o.label}</span>
                <span className="block text-xs text-slate-500">{o.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Contact number to share" subtitle="Released only to a member whose interest you accept. Leave blank to use your registered mobile number." />
        <div className="flex flex-wrap items-end gap-3">
          <Input className="min-w-[14rem] flex-1" label="Contact number (e.g. a parent's)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button className="btn-primary" disabled={busy} onClick={() => update({ contact_phone: phone.trim() }, 'Contact number saved')}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : null} Save
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Delete matrimony profile" subtitle="Removes your matrimony details, shortlists and requests. Your community membership is not affected." />
        <button className="btn-danger" onClick={() => setConfirmDelete(true)} disabled={busy}><Trash2 size={15} /> Delete matrimony profile</button>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        loading={busy}
        onConfirm={remove}
        title="Delete matrimony profile?"
        description="This cannot be undone. Uploaded photo and horoscope files should be removed from your profile first if you want them deleted too."
        confirmLabel="Delete"
      />
    </div>
  )
}
