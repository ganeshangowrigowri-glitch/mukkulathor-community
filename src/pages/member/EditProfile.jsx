import { useState } from 'react'
import toast from 'react-hot-toast'
import { Camera, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, uploadProfilePhoto } from '../../services/profileService'
import EditableSection from '../../components/dashboard/EditableSection'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import FadeIn from '../../components/ui/FadeIn'
import { GENDERS, BLOOD_GROUPS, MARITAL_STATUSES, VISION_REASONS } from '../../lib/constants'

function ViewGrid({ items }) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs text-slate-400">{label}</dt>
          <dd className="mt-0.5 break-words text-sm font-medium text-slate-800">{value || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function EditProfile() {
  const { profile, refreshProfile } = useAuth()
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  if (!profile) return null

  // sub_clan / marital_status are what the registration wizard writes now;
  // sub_group / marriage_status are the older columns kept in sync
  // automatically (see migration 0009) — prefer the new field, fall back to
  // the old one so already-approved profiles still show correctly.
  const subClan = profile.sub_clan || profile.sub_group
  const maritalStatus = profile.marital_status || profile.marriage_status

  async function save(updates) {
    await updateProfile(profile.id, updates)
    await refreshProfile()
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      await uploadProfilePhoto(profile.id, file)
      await refreshProfile()
      toast.success('Profile photo updated')
    } catch (err) {
      toast.error(err.message || 'Could not upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update your details — each section saves independently.</p>
      </FadeIn>

      <FadeIn delay={50} className="card flex flex-col items-center gap-4 p-6 sm:flex-row">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-2xl font-semibold text-navy-700">
            {profile.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              profile.full_name?.[0]?.toUpperCase()
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gold-500 text-navy-900 shadow-card hover:bg-gold-600">
            {uploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploadingPhoto} />
          </label>
        </div>
        <div className="text-center sm:text-left">
          <p className="font-display text-lg font-semibold text-navy-900">{profile.full_name}</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <p className="mt-1 text-xs text-slate-400">JPG or PNG, up to 5MB</p>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <EditableSection
          title="Personal Details"
          values={{
            full_name: profile.full_name, gender: profile.gender, dob: profile.dob,
            blood_group: profile.blood_group, mobile: profile.mobile, email: profile.email,
          }}
          onSave={save}
          renderView={(v) => (
            <ViewGrid items={[
              ['Full Name', v.full_name], ['Gender', v.gender],
              ['Date of Birth', v.dob], ['Blood Group', v.blood_group],
              ['Mobile', v.mobile], ['Email', v.email],
            ]} />
          )}
          renderForm={(draft, setDraft) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full Name" value={draft.full_name || ''} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} />
              <Select label="Gender" options={GENDERS} value={draft.gender || ''} onChange={(e) => setDraft({ ...draft, gender: e.target.value })} />
              <Input type="date" label="Date of Birth" value={draft.dob || ''} onChange={(e) => setDraft({ ...draft, dob: e.target.value })} />
              <Select label="Blood Group" options={BLOOD_GROUPS.map((b) => ({ value: b, label: b }))} value={draft.blood_group || ''} onChange={(e) => setDraft({ ...draft, blood_group: e.target.value })} />
              <Input label="Mobile" value={draft.mobile || ''} onChange={(e) => setDraft({ ...draft, mobile: e.target.value })} />
              <Input type="email" label="Email" value={draft.email || ''} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </div>
          )}
        />
      </FadeIn>

      <FadeIn delay={150}>
        <EditableSection
          title="Address & Location"
          values={{
            address: profile.address, village: profile.village, district: profile.district,
            country: profile.country, native_place: profile.native_place,
          }}
          onSave={save}
          renderView={(v) => (
            <ViewGrid items={[
              ['Address', v.address], ['Village/Town', v.village],
              ['District', v.district], ['Country', v.country], ['Native Place', v.native_place],
            ]} />
          )}
          renderForm={(draft, setDraft) => (
            <div className="space-y-4">
              <Textarea label="Address" value={draft.address || ''} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Village/Town" value={draft.village || ''} onChange={(e) => setDraft({ ...draft, village: e.target.value })} />
                <Input label="District" value={draft.district || ''} onChange={(e) => setDraft({ ...draft, district: e.target.value })} />
                <Input label="Country" value={draft.country || ''} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
                <Input label="Native Place" value={draft.native_place || ''} onChange={(e) => setDraft({ ...draft, native_place: e.target.value })} />
              </div>
            </div>
          )}
        />
      </FadeIn>

      <FadeIn delay={200}>
        <EditableSection
          title="Education & Occupation"
          values={{
            education: profile.education, occupation: profile.occupation,
            business_details: profile.business_details, professional_details: profile.professional_details,
          }}
          onSave={save}
          renderView={(v) => (
            <ViewGrid items={[
              ['Education', v.education], ['Occupation', v.occupation],
              ['Business Details', v.business_details], ['Professional Details', v.professional_details],
            ]} />
          )}
          renderForm={(draft, setDraft) => (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Education" value={draft.education || ''} onChange={(e) => setDraft({ ...draft, education: e.target.value })} />
                <Input label="Occupation" value={draft.occupation || ''} onChange={(e) => setDraft({ ...draft, occupation: e.target.value })} />
              </div>
              <Textarea label="Business Details" value={draft.business_details || ''} onChange={(e) => setDraft({ ...draft, business_details: e.target.value })} />
              <Textarea label="Professional Details" value={draft.professional_details || ''} onChange={(e) => setDraft({ ...draft, professional_details: e.target.value })} />
            </div>
          )}
        />
      </FadeIn>

      <FadeIn delay={250}>
        <EditableSection
          title="Community & Lineage"
          values={{
            sub_clan: subClan, title: profile.title, gothram: profile.gothram,
            kula_deivam: profile.kula_deivam, kula_deivam_place: profile.kula_deivam_place,
            kaval_deivam: profile.kaval_deivam, kaval_deivam_place: profile.kaval_deivam_place,
            father_name: profile.father_name, father_birth_place: profile.father_birth_place,
            grandfather_name: profile.grandfather_name, grandfather_birth_place: profile.grandfather_birth_place,
            great_grandfather_name: profile.great_grandfather_name, great_grandfather_birth_place: profile.great_grandfather_birth_place,
          }}
          onSave={save}
          renderView={(v) => (
            <ViewGrid items={[
              ['Sub-Clan', v.sub_clan], ['Pattam (Title)', v.title], ['Gothram', v.gothram],
              ['Kula Deivam', v.kula_deivam], ['Kula Deivam Place', v.kula_deivam_place],
              ['Kaval Deivam', v.kaval_deivam], ['Kaval Deivam Place', v.kaval_deivam_place],
              ["Father's Name", v.father_name], ["Father's Birth Place", v.father_birth_place],
              ["Grandfather's Name", v.grandfather_name], ["Grandfather's Birth Place", v.grandfather_birth_place],
              ["Great-Grandfather's Name", v.great_grandfather_name], ["Great-Grandfather's Birth Place", v.great_grandfather_birth_place],
            ]} />
          )}
          renderForm={(draft, setDraft) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Sub-Clan" value={draft.sub_clan || ''} onChange={(e) => setDraft({ ...draft, sub_clan: e.target.value })} />
              <Input label="Pattam (Title)" value={draft.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <Input label="Gothram" value={draft.gothram || ''} onChange={(e) => setDraft({ ...draft, gothram: e.target.value })} />
              <Input label="Kula Deivam" value={draft.kula_deivam || ''} onChange={(e) => setDraft({ ...draft, kula_deivam: e.target.value })} />
              <Input label="Kula Deivam Place" value={draft.kula_deivam_place || ''} onChange={(e) => setDraft({ ...draft, kula_deivam_place: e.target.value })} />
              <Input label="Kaval Deivam" value={draft.kaval_deivam || ''} onChange={(e) => setDraft({ ...draft, kaval_deivam: e.target.value })} />
              <Input label="Kaval Deivam Place" value={draft.kaval_deivam_place || ''} onChange={(e) => setDraft({ ...draft, kaval_deivam_place: e.target.value })} />
              <Input label="Father's Name" value={draft.father_name || ''} onChange={(e) => setDraft({ ...draft, father_name: e.target.value })} />
              <Input label="Father's Birth Place" value={draft.father_birth_place || ''} onChange={(e) => setDraft({ ...draft, father_birth_place: e.target.value })} />
              <Input label="Grandfather's Name" value={draft.grandfather_name || ''} onChange={(e) => setDraft({ ...draft, grandfather_name: e.target.value })} />
              <Input label="Grandfather's Birth Place" value={draft.grandfather_birth_place || ''} onChange={(e) => setDraft({ ...draft, grandfather_birth_place: e.target.value })} />
              <Input label="Great-Grandfather's Name" value={draft.great_grandfather_name || ''} onChange={(e) => setDraft({ ...draft, great_grandfather_name: e.target.value })} />
              <Input label="Great-Grandfather's Birth Place" value={draft.great_grandfather_birth_place || ''} onChange={(e) => setDraft({ ...draft, great_grandfather_birth_place: e.target.value })} />
            </div>
          )}
        />
      </FadeIn>

      <FadeIn delay={300}>
        <EditableSection
          title="Marriage & Spouse"
          values={{
            marital_status: maritalStatus, marriage_date: profile.marriage_date,
            spouse_full_name: profile.spouse_full_name,
          }}
          onSave={save}
          renderView={(v) => (
            <ViewGrid items={[
              ['Marital Status', v.marital_status], ['Marriage Date', v.marriage_date],
              ['Spouse Name', v.spouse_full_name],
            ]} />
          )}
          renderForm={(draft, setDraft) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Marital Status" options={MARITAL_STATUSES} value={draft.marital_status || ''} onChange={(e) => setDraft({ ...draft, marital_status: e.target.value })} />
              <Input type="date" label="Marriage Date" value={draft.marriage_date || ''} onChange={(e) => setDraft({ ...draft, marriage_date: e.target.value })} />
              {draft.marital_status === 'married' && (
                <Input label="Spouse Name" value={draft.spouse_full_name || ''} onChange={(e) => setDraft({ ...draft, spouse_full_name: e.target.value })} />
              )}
            </div>
          )}
        />
      </FadeIn>

      <FadeIn delay={350}>
        <EditableSection
          title="Vision to Join"
          description="Select all reasons that apply to you."
          values={{ vision_reasons: Array.isArray(profile.vision_reasons) ? profile.vision_reasons : [] }}
          onSave={save}
          renderView={(v) => (
            <div className="flex flex-wrap gap-1.5">
              {v.vision_reasons?.length ? v.vision_reasons.map((r) => (
                <span key={r} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{r}</span>
              )) : <p className="text-sm text-slate-400">Not specified.</p>}
            </div>
          )}
          renderForm={(draft, setDraft) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {VISION_REASONS.map((reason) => {
                const checked = draft.vision_reasons?.includes(reason)
                return (
                  <label key={reason} className="flex items-center gap-2 rounded-sm2 border border-slate-200 p-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(draft.vision_reasons || []), reason]
                          : (draft.vision_reasons || []).filter((r) => r !== reason)
                        setDraft({ ...draft, vision_reasons: next })
                      }}
                    />
                    {reason}
                  </label>
                )
              })}
            </div>
          )}
        />
      </FadeIn>
    </div>
  )
}