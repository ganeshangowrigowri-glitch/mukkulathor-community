import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getProfile, updateProfile, uploadProfilePhoto } from '../../services/profileService'
import { listFamilyMembers, syncFamilyMembers, syncFamilyTree, uploadFamilyPhoto } from '../../services/familyService'
import { uploadDocument } from '../../services/documentService'
import { submitRegistration } from '../../services/refereeService'
import PageLoader from '../ui/PageLoader'
import LineageSection from './sections/LineageSection'
import PersonalDetailsSection from './sections/PersonalDetailsSection'
import ProfessionalEducationSection from './sections/ProfessionalEducationSection'
import VisionSection from './sections/VisionSection'
import MarriageChildrenSection from './sections/MarriageChildrenSection'
import RefereesSection from './sections/RefereesSection'
import UploadsSection from './sections/UploadsSection'

const MIN_REFEREES = 1
const MAX_REFEREES = 5

export default function RegistrationWizard() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [localProfile, setLocalProfile] = useState(profile)
  const [familyMembers, setFamilyMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedReferees, setSelectedReferees] = useState([])
  const [refereeError, setRefereeError] = useState('')

  const [profilePhoto, setProfilePhoto] = useState(null)
  const [familyPhotos, setFamilyPhotos] = useState([])
  const [supportingDocs, setSupportingDocs] = useState([])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { children: [] } })

  const load = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    const [p, fm] = await Promise.all([getProfile(profile.id), listFamilyMembers(profile.id)])
    setLocalProfile(p)
    setFamilyMembers(fm)
    reset({
      full_name: p.full_name || '',
      gender: p.gender || '',
      marital_status: p.marital_status || '',
      city: p.city || '',
      district: p.district || '',
      province: p.province || '',
      country: p.country || 'Sri Lanka',
      mobile: p.mobile || '',
      email: p.email || '',
      whatsapp: p.whatsapp || '',
      facebook_url: p.facebook_url || '',
      address: p.address || '',

      great_grandfather_name: p.great_grandfather_name || '',
      great_grandfather_birth_place: p.great_grandfather_birth_place || '',
      great_grandfather_birth_country: p.great_grandfather_birth_country || 'Sri Lanka',
      great_grandfather_family_tree_name: p.great_grandfather_family_tree_name || '',
      grandfather_name: p.grandfather_name || '',
      grandfather_birth_place: p.grandfather_birth_place || '',
      grandfather_birth_country: p.grandfather_birth_country || 'Sri Lanka',
      grandfather_city: p.grandfather_city || '',
      branch: p.branch || '',
      sub_clan: p.sub_clan || '',
      title: p.title || '',
      kula_deivam: p.kula_deivam || '',
      kula_deivam_place: p.kula_deivam_place || '',
      kula_deivam_country: p.kula_deivam_country || 'Sri Lanka',
      kaval_deivam: p.kaval_deivam || '',
      kaval_deivam_place: p.kaval_deivam_place || '',
      kaval_deivam_country: p.kaval_deivam_country || 'Sri Lanka',
      gothram: p.gothram || '',
      father_name: p.father_name || '',
      father_birth_place: p.father_birth_place || '',
      father_birth_country: p.father_birth_country || 'Sri Lanka',
      birth_place: p.birth_place || '',
      birth_country: p.birth_country || 'Sri Lanka',

      qualifications: p.qualifications || [],
      qualification_institutions: p.qualification_institutions || {},
      professional_category: p.professional_category || '',
      business_name: p.business_name || '',
      business_city: p.business_city || '',
      business_nature: p.business_nature || '',
      doctor_hospital: p.doctor_hospital || '',
      doctor_organization: p.doctor_organization || '',
      doctor_city: p.doctor_city || '',
      bank_name: p.bank_name || '',
      bank_organization: p.bank_organization || '',
      bank_city: p.bank_city || '',
      bank_position: p.bank_position || '',
      teacher_school: p.teacher_school || '',
      teacher_city: p.teacher_city || '',

      vision_reasons: p.vision_reasons || [],

      spouse_full_name: p.spouse_full_name || '',
      family_id: p.family_id || '',
      spouse_is_mukkulathor: p.spouse_is_mukkulathor === true ? 'yes' : p.spouse_is_mukkulathor === false ? 'no' : '',
      spouse_great_grandfather_name: p.spouse_lineage?.great_grandfather_name || '',
      spouse_great_grandfather_birth_place: p.spouse_lineage?.great_grandfather_birth_place || '',
      spouse_great_grandfather_birth_country: p.spouse_lineage?.great_grandfather_birth_country || 'Sri Lanka',
      spouse_great_grandfather_family_tree_name: p.spouse_lineage?.great_grandfather_family_tree_name || '',
      spouse_grandfather_name: p.spouse_lineage?.grandfather_name || '',
      spouse_grandfather_birth_place: p.spouse_lineage?.grandfather_birth_place || '',
      spouse_grandfather_birth_country: p.spouse_lineage?.grandfather_birth_country || 'Sri Lanka',
      spouse_grandfather_city: p.spouse_lineage?.grandfather_city || '',
      spouse_branch: p.spouse_lineage?.branch || '',
      spouse_sub_clan: p.spouse_lineage?.sub_clan || '',
      spouse_title: p.spouse_lineage?.title || '',
      spouse_kula_deivam: p.spouse_lineage?.kula_deivam || '',
      spouse_kula_deivam_place: p.spouse_lineage?.kula_deivam_place || '',
      spouse_kula_deivam_country: p.spouse_lineage?.kula_deivam_country || 'Sri Lanka',
      spouse_kaval_deivam: p.spouse_lineage?.kaval_deivam || '',
      spouse_kaval_deivam_place: p.spouse_lineage?.kaval_deivam_place || '',
      spouse_kaval_deivam_country: p.spouse_lineage?.kaval_deivam_country || 'Sri Lanka',
      spouse_gothram: p.spouse_lineage?.gothram || '',
      spouse_father_name: p.spouse_lineage?.father_name || '',
      spouse_father_birth_place: p.spouse_lineage?.father_birth_place || '',
      spouse_father_birth_country: p.spouse_lineage?.father_birth_country || 'Sri Lanka',
      spouse_birth_place: p.spouse_lineage?.spouse_birth_place || '',
      spouse_birth_country: p.spouse_lineage?.spouse_birth_country || 'Sri Lanka',

      children:
        fm
          .filter((m) => m.relation_type === 'child')
          .map((m) => ({ full_name: m.full_name || '', gender: m.gender || '', dob: m.dob || '' })) || [],
    })
    setLoading(false)
  }, [profile?.id, reset])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (localProfile && localProfile.registration_status !== 'draft') {
      navigate('/member/status', { replace: true })
    }
  }, [localProfile, navigate])

  async function onSubmit(data) {
    if (selectedReferees.length < MIN_REFEREES || selectedReferees.length > MAX_REFEREES) {
      setRefereeError(`Please select between ${MIN_REFEREES} and ${MAX_REFEREES} referees before submitting.`)
      document.getElementById('referees-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setRefereeError('')
    setSubmitting(true)
    try {
      const {
        children,
        spouse_great_grandfather_name,
        spouse_great_grandfather_birth_place,
        spouse_great_grandfather_birth_country,
        spouse_great_grandfather_family_tree_name,
        spouse_grandfather_name,
        spouse_grandfather_birth_place,
        spouse_grandfather_birth_country,
        spouse_grandfather_city,
        spouse_branch,
        spouse_sub_clan,
        spouse_title,
        spouse_kula_deivam,
        spouse_kula_deivam_place,
        spouse_kula_deivam_country,
        spouse_kaval_deivam,
        spouse_kaval_deivam_place,
        spouse_kaval_deivam_country,
        spouse_gothram,
        spouse_father_name,
        spouse_father_birth_place,
        spouse_father_birth_country,
        spouse_birth_place,
        spouse_birth_country,
        spouse_is_mukkulathor,
        ...rest
      } = data

      const spouseLineage =
        rest.marital_status === 'married' && spouse_is_mukkulathor === 'yes'
          ? {
              great_grandfather_name: spouse_great_grandfather_name,
              great_grandfather_birth_place: spouse_great_grandfather_birth_place,
              great_grandfather_birth_country: spouse_great_grandfather_birth_country,
              great_grandfather_family_tree_name: spouse_great_grandfather_family_tree_name,
              grandfather_name: spouse_grandfather_name,
              grandfather_birth_place: spouse_grandfather_birth_place,
              grandfather_birth_country: spouse_grandfather_birth_country,
              grandfather_city: spouse_grandfather_city,
              branch: spouse_branch,
              sub_clan: spouse_sub_clan,
              title: spouse_title,
              kula_deivam: spouse_kula_deivam,
              kula_deivam_place: spouse_kula_deivam_place,
              kula_deivam_country: spouse_kula_deivam_country,
              kaval_deivam: spouse_kaval_deivam,
              kaval_deivam_place: spouse_kaval_deivam_place,
              kaval_deivam_country: spouse_kaval_deivam_country,
              gothram: spouse_gothram,
              father_name: spouse_father_name,
              father_birth_place: spouse_father_birth_place,
              father_birth_country: spouse_father_birth_country,
              spouse_birth_place,
              spouse_birth_country,
            }
          : null

      const profileUpdates = {
        ...rest,
        spouse_is_mukkulathor: rest.marital_status === 'married' ? spouse_is_mukkulathor === 'yes' : null,
        spouse_lineage: spouseLineage,
      }

      const updated = await updateProfile(profile.id, profileUpdates)
      setLocalProfile(updated)

      const childMembers = children.map((c) => ({ ...c, relation_type: 'child', dob: c.dob || null }))
      const saved = await syncFamilyMembers(profile.id, childMembers)
      await syncFamilyTree(profile.id, saved)
      setFamilyMembers(saved)

      if (profilePhoto) await uploadProfilePhoto(profile.id, profilePhoto)
      for (const file of familyPhotos) await uploadFamilyPhoto(profile.id, file)
      for (const file of supportingDocs) await uploadDocument(profile.id, file, 'supporting_document')

      await submitRegistration(selectedReferees)
      await refreshProfile()

      toast.success('Registration submitted for referee verification')
      navigate('/member/status')
    } catch (err) {
      toast.error(err.message || 'Could not submit registration')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !localProfile) return <PageLoader label="Loading your registration…" />

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-navy-900">Membership Registration</h1>
      <p className="mt-1 text-sm text-slate-500">
        Complete the form below and submit it for referee verification. This follows the same layout as the
        official registration form.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-10">
        <section className="card p-6 sm:p-8">
          <LineageSection register={register} control={control} title="Your Family Lineage" />
        </section>

        <section className="card p-6 sm:p-8">
          <PersonalDetailsSection register={register} errors={errors} />
        </section>

        <section className="card p-6 sm:p-8">
          <ProfessionalEducationSection register={register} control={control} />
        </section>

        <section className="card p-6 sm:p-8">
          <VisionSection control={control} />
        </section>

        <section className="card p-6 sm:p-8">
          <MarriageChildrenSection register={register} control={control} />
        </section>

        <section id="referees-section" className="card p-6 sm:p-8">
          <RefereesSection selected={selectedReferees} onChange={setSelectedReferees} error={refereeError} />
        </section>

        <section className="card p-6 sm:p-8">
          <UploadsSection
            profile={localProfile}
            onProfilePhoto={setProfilePhoto}
            onFamilyPhotos={setFamilyPhotos}
            onSupportingDocs={setSupportingDocs}
          />
        </section>

        <div className="flex justify-end pb-10">
          <button type="submit" disabled={submitting} className="btn-gold w-full sm:w-auto">
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  )
}