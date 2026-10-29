import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Save, Eye, UploadCloud } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useSupabaseQuery } from '../../../hooks/useSupabaseQuery'
import {
  getMyMatrimonyProfile, saveMyMatrimonyProfile, uploadMatrimonyPhoto, uploadMatrimonyHoroscope, MATRIMONY_BUCKETS,
} from '../../../services/matrimonyService'
import { BRANCHES, MATRIMONY_MARITAL, MATRIMONY_DIET, MATRIMONY_JATHAKAM } from '../../../lib/constants'
import { Card, CardHeader } from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'
import PageLoader from '../../../components/ui/PageLoader'
import ErrorState from '../../../components/ui/ErrorState'
import SignedImage from '../../../components/matrimony/SignedImage'
import ProfileDetailModal from '../../../components/matrimony/ProfileDetailModal'

const FIELDS = [
  'height_cm', 'marital_status', 'diet', 'education_summary', 'occupation_title', 'employer', 'income_range', 'about',
  'veettu_peyar', 'kootam', 'kula_deivam', 'native_place',
  'jathakam_type', 'rasi', 'nakshatram', 'padam', 'dosham_note',
  'pref_age_min', 'pref_age_max', 'pref_branches', 'pref_education', 'pref_location', 'pref_notes',
]
const NUMERIC = ['height_cm', 'padam', 'pref_age_min', 'pref_age_max']

const MARITAL_MAP = { single: 'never_married', divorced: 'divorced', widowed: 'widowed' }

// Values the member already gave at registration, used when a matrimony field is still empty.
function fromRegistration(profile) {
  if (!profile) return {}
  const quals = Array.isArray(profile.qualifications) ? profile.qualifications.join(', ') : ''
  return {
    marital_status: MARITAL_MAP[profile.marital_status || profile.marriage_status] || '',
    education_summary: profile.education || quals,
    occupation_title: profile.occupation || '',
    kula_deivam: profile.kula_deivam || '',
    kootam: profile.gothram || '',
    native_place: profile.native_place || '',
  }
}

function toForm(row, profile) {
  const base = fromRegistration(profile)
  const f = {}
  FIELDS.forEach((k) => {
    const v = row?.[k]
    f[k] = v !== null && v !== undefined && v !== '' ? v : (base[k] ?? (k === 'pref_branches' ? [] : ''))
  })
  return f
}


export default function MatrimonyMyProfile() {
  const { profile } = useAuth()
  const { data: row, loading, error, refetch } = useSupabaseQuery(
    useCallback(() => getMyMatrimonyProfile(profile.id), [profile.id]), [profile.id]
  )
  const [form, setForm] = useState(() => toForm(null, profile))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [preview, setPreview] = useState(false)

   useEffect(() => { setForm(toForm(row, profile)) }, [row, profile])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleBranch = (b) =>
    setForm((f) => ({ ...f, pref_branches: f.pref_branches.includes(b) ? f.pref_branches.filter((x) => x !== b) : [...f.pref_branches, b] }))

  async function save() {
    setSaving(true)
    try {
      const payload = { ...form }
      NUMERIC.forEach((k) => { payload[k] = payload[k] === '' ? null : Number(payload[k]) })
      if (!payload.pref_branches.length) payload.pref_branches = null
      await saveMyMatrimonyProfile(profile.id, payload)
      toast.success('Matrimony profile saved')
      refetch()
    } catch (e) {
      toast.error(e.message || 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  async function upload(kind, file) {
    if (!file) return
    setUploading(kind)
    try {
      if (kind === 'photo') await uploadMatrimonyPhoto(profile.id, file, row?.photo_path)
      else await uploadMatrimonyHoroscope(profile.id, file, row?.horoscope_path)
      toast.success(kind === 'photo' ? 'Photo uploaded' : 'Horoscope uploaded')
      refetch()
    } catch (e) {
      toast.error(e.message || 'Upload failed')
    } finally {
      setUploading('')
    }
  }

  if (loading) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {row ? <>Your registry code: <b className="text-navy-800">{row.member_code}</b></> : 'Save once to get your registry code.'}
          {' '}Publish from <b>Privacy Controls</b> when ready.
        </p>
        <div className="flex gap-2">
          {row && <button className="btn-outline" onClick={() => setPreview(true)}><Eye size={15} /> Preview</button>}
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>
      </div>

      <Card>
        <CardHeader title="Photo & horoscope" subtitle="Stored privately. Only people you allow can open them." />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="label-field">Profile photo</p>
            {row?.photo_path && <SignedImage bucket={MATRIMONY_BUCKETS.PHOTOS} path={row.photo_path} className="mb-2 h-36 w-36 rounded-xl" />}
            <label className="btn-outline cursor-pointer">
              {uploading === 'photo' ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />} {row?.photo_path ? 'Replace photo' : 'Upload photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={!row || !!uploading}
                onChange={(e) => upload('photo', e.target.files?.[0])} />
            </label>
            <p className="mt-1 text-xs text-slate-400">JPG, PNG or WebP, up to 5 MB.{!row && ' Save your profile first.'}</p>
          </div>
          <div>
            <p className="label-field">Horoscope (Jathakam) file</p>
            {row?.horoscope_path && <p className="mb-2 text-sm text-emerald-700">Horoscope file uploaded ✓</p>}
            <label className="btn-outline cursor-pointer">
              {uploading === 'horoscope' ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />} {row?.horoscope_path ? 'Replace file' : 'Upload file'}
              <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" disabled={!row || !!uploading}
                onChange={(e) => upload('horoscope', e.target.files?.[0])} />
            </label>
            <p className="mt-1 text-xs text-slate-400">PDF, JPG or PNG, up to 8 MB. Shared only after you accept an interest.{!row && ' Save your profile first.'}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="About you" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Height (cm)" type="number" min="100" max="250" value={form.height_cm} onChange={set('height_cm')} />
          <Select label="Marital status" value={form.marital_status} onChange={set('marital_status')} placeholder="Select" options={MATRIMONY_MARITAL} />
          <Select label="Diet" value={form.diet} onChange={set('diet')} placeholder="Select" options={MATRIMONY_DIET} />
          <Input label="Education" value={form.education_summary} onChange={set('education_summary')} placeholder="e.g. B.Sc (Hons) Computer Engineering" />
          <Input label="Occupation" value={form.occupation_title} onChange={set('occupation_title')} />
          <Input label="Employer" value={form.employer} onChange={set('employer')} />
          <Input label="Income range (private)" value={form.income_range} onChange={set('income_range')} hint="Only you and administrators can see this." />
        </div>
        <Textarea className="mt-4" label="Short introduction" rows={4} value={form.about} onChange={set('about')} />
      </Card>

      <Card>
        <CardHeader title="Lineage" subtitle="Used for the exogamy rule: members with the same Veettu Peyar are never suggested to each other." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Veettu Peyar" value={form.veettu_peyar} onChange={set('veettu_peyar')} />
          <Input label="Kootam / Gothram" value={form.kootam} onChange={set('kootam')} />
          <Input label="Kula Deivam" value={form.kula_deivam} onChange={set('kula_deivam')} />
          <Input label="Ancestral home" value={form.native_place} onChange={set('native_place')} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Horoscope details" subtitle="Only the type is visible to others; the rest is released after you accept an interest." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Jathakam type" value={form.jathakam_type} onChange={set('jathakam_type')} placeholder="Select" options={MATRIMONY_JATHAKAM} />
          <Input label="Rasi" value={form.rasi} onChange={set('rasi')} />
          <Input label="Nakshatram" value={form.nakshatram} onChange={set('nakshatram')} />
          <Input label="Padam (1–4)" type="number" min="1" max="4" value={form.padam} onChange={set('padam')} />
        </div>
        <Textarea className="mt-4" label="Dosham note" rows={2} value={form.dosham_note} onChange={set('dosham_note')} />
      </Card>

      <Card>
        <CardHeader title="Partner preferences" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Age from" type="number" min="18" max="80" value={form.pref_age_min} onChange={set('pref_age_min')} />
          <Input label="Age to" type="number" min="18" max="80" value={form.pref_age_max} onChange={set('pref_age_max')} />
          <Input label="Education" value={form.pref_education} onChange={set('pref_education')} />
          <Input label="Location" value={form.pref_location} onChange={set('pref_location')} />
        </div>
        <div className="mt-4">
          <p className="label-field">Clan</p>
          <div className="flex flex-wrap gap-4">
            {BRANCHES.map((b) => (
              <label key={b.value} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="h-4 w-4 accent-navy-700" checked={form.pref_branches.includes(b.value)} onChange={() => toggleBranch(b.value)} />
                {b.label}
              </label>
            ))}
          </div>
        </div>
        <Textarea className="mt-4" label="Other expectations" rows={3} value={form.pref_notes} onChange={set('pref_notes')} />
      </Card>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
        </button>
      </div>

      <ProfileDetailModal open={preview} profileId={profile.id} onClose={() => setPreview(false)} />
    </div>
  )
}
