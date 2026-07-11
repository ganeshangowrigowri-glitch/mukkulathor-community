import { Link } from 'react-router-dom'
import { Pencil, Mail, Phone, MapPin, Droplet, Calendar, Cake } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import FadeIn from '../../components/ui/FadeIn'
import { REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_BADGE } from '../../lib/constants'
import { format } from 'date-fns'

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon size={16} className="mt-0.5 shrink-0 text-slate-400" />}
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="break-words text-sm font-medium text-slate-800">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function Profile() {
  const { profile } = useAuth()
  if (!profile) return null

  // sub_clan / marital_status are what the current registration wizard writes;
  // sub_group / marriage_status are the older columns kept in sync automatically
  // (see migration 0009) — prefer the new field, fall back to the old one so
  // already-approved profiles still display correctly.
  const subClan = profile.sub_clan || profile.sub_group
  const maritalStatus = profile.marital_status || profile.marriage_status
  const qualifications = Array.isArray(profile.qualifications) ? profile.qualifications : []
  const visionReasons = Array.isArray(profile.vision_reasons) ? profile.vision_reasons : []

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Your personal details as recorded in the registry.</p>
        </div>
        <Link to="/member/edit-profile" className="btn-primary w-full sm:w-auto">
          <Pencil size={15} /> Edit Profile
        </Link>
      </FadeIn>

      <FadeIn delay={50} className="card overflow-hidden p-0">
        <div className="bg-navy-900 px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-navy-700 text-2xl font-semibold text-white">
              {profile.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt={profile.full_name} className="h-full w-full object-cover" />
              ) : (
                profile.full_name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="font-display text-xl font-semibold text-white">{profile.full_name}</h2>
              <p className="mt-1 text-sm text-slate-300">{profile.occupation || 'Community Member'}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge tone={REGISTRATION_STATUS_BADGE[profile.registration_status]?.replace('badge-', '')}>
                  {REGISTRATION_STATUS_LABELS[profile.registration_status]}
                </Badge>
                {profile.family_id && <Badge tone="grey">ID: {profile.family_id}</Badge>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          <Field icon={Mail} label="Email" value={profile.email} />
          <Field icon={Phone} label="Mobile" value={profile.mobile} />
          <Field icon={Cake} label="Date of Birth" value={profile.dob && format(new Date(profile.dob), 'dd MMM yyyy')} />
          <Field icon={Droplet} label="Blood Group" value={profile.blood_group} />
          <Field icon={MapPin} label="Address" value={profile.address} />
          <Field icon={Calendar} label="Member Since" value={profile.created_at && format(new Date(profile.created_at), 'dd MMM yyyy')} />
        </div>
      </FadeIn>

      <div className="grid gap-6 sm:grid-cols-2">
        <FadeIn delay={100}>
          <Card>
            <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" value={profile.city} />
              <Field label="Village/Town" value={profile.village} />
              <Field label="District" value={profile.district} />
              <Field label="Province" value={profile.province} />
              <Field label="Country" value={profile.country} />
              <Field label="Native Place" value={profile.native_place} />
            </div>
          </Card>
        </FadeIn>
        <FadeIn delay={150}>
          <Card>
            <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Education &amp; Profession</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Education" value={profile.education} />
              <Field label="Qualifications" value={qualifications.join(', ')} />
              <Field label="Occupation" value={profile.occupation} />
              <Field label="Professional Category" value={profile.professional_category} />
              <Field label="Business Name" value={profile.business_name} />
              <Field label="Hospital / Where" value={profile.doctor_hospital} />
              <Field label="Bank / Where" value={profile.bank_name} />
              <Field label="School / Institution" value={profile.teacher_school} />
            </div>
          </Card>
        </FadeIn>
        <FadeIn delay={200}>
          <Card>
            <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Community &amp; Lineage</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kilai (Branch)" value={profile.branch} />
              <Field label="Sub-Clan" value={subClan} />
              <Field label="Pattam (Title)" value={profile.title} />
              <Field label="Gothram" value={profile.gothram} />
              <Field label="Kula Deivam" value={profile.kula_deivam} />
              <Field label="Kaval Deivam" value={profile.kaval_deivam} />
              <Field label="Father's Name" value={profile.father_name} />
              <Field label="Grandfather's Name" value={profile.grandfather_name} />
              <Field label="Great-Grandfather's Name" value={profile.great_grandfather_name} />
            </div>
          </Card>
        </FadeIn>
        {maritalStatus === 'married' && (
          <FadeIn delay={250}>
            <Card>
              <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Marriage &amp; Spouse</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Marriage Date" value={profile.marriage_date} />
                <Field label="Spouse Name" value={profile.spouse_full_name} />
                <Field label="Spouse is Mukkulathor" value={profile.spouse_is_mukkulathor === true ? 'Yes' : profile.spouse_is_mukkulathor === false ? 'No' : null} />
                <Field label="Spouse Sub-Clan" value={profile.spouse_lineage?.sub_clan || profile.spouse_lineage?.sub_group} />
              </div>
            </Card>
          </FadeIn>
        )}
        {visionReasons.length > 0 && (
          <FadeIn delay={300}>
            <Card>
              <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Vision to Join</h3>
              <div className="flex flex-wrap gap-1.5">
                {visionReasons.map((reason) => <Badge key={reason} tone="grey">{reason}</Badge>)}
              </div>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  )
}