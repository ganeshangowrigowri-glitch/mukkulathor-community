import { useState } from 'react'
import toast from 'react-hot-toast'
import { Mail, Phone, MapPin, FileText, Download, Loader2, Check, X } from 'lucide-react'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import Textarea from '../ui/Textarea'
import { SkeletonText } from '../ui/Skeleton'
import { RELATION_LABELS, DOCUMENT_TYPES } from '../../lib/constants'
import { getDocumentSignedUrl } from '../../services/documentService'
import { decideRecommendation } from '../../services/refereeService'

const DOC_LABELS = DOCUMENT_TYPES.reduce((acc, d) => ({ ...acc, [d.value]: d.label }), {})

function DocumentRow({ doc }) {
  const [loading, setLoading] = useState(false)

  async function handleView() {
    setLoading(true)
    try {
      const url = await getDocumentSignedUrl(doc.file_url)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      toast.error('Could not open document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleView}
      disabled={loading}
      className="flex w-full items-center justify-between gap-3 rounded-sm2 border border-slate-200 px-3.5 py-2.5 text-left hover:border-navy-300 hover:bg-navy-50/40"
    >
      <span className="flex items-center gap-2 min-w-0">
        <FileText size={15} className="shrink-0 text-slate-400" />
        <span className="min-w-0 truncate text-sm text-slate-700">{doc.file_name || DOC_LABELS[doc.doc_type]}</span>
      </span>
      {loading ? <Loader2 size={14} className="shrink-0 animate-spin text-slate-400" /> : <Download size={14} className="shrink-0 text-slate-400" />}
    </button>
  )
}

// Small helper — renders a labeled value only when it's actually present, so
// sections don't fill up with empty "—" rows for fields the applicant left
// blank (lineage / spouse fields are mostly optional).
function Field({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-slate-700">{value}</dd>
    </div>
  )
}

export default function ApplicantReviewModal({ open, onClose, recommendation, detail, loading, onDecided }) {
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleDecide(status) {
    setSubmitting(true)
    try {
      await decideRecommendation(recommendation.id, status, comments)
      toast.success(status === 'approved' ? 'Application recommended' : 'Application rejected')
      onDecided?.()
      onClose()
      setComments('')
    } catch (err) {
      toast.error(err.message || 'Could not submit your decision')
    } finally {
      setSubmitting(false)
    }
  }

  const profile = detail?.profile
  const isPending = recommendation?.status === 'pending'

  // sub_clan / marital_status are the fields the current wizard writes to;
  // sub_group / marriage_status are the older columns kept in sync for
  // backward compatibility (see migration 0009). Prefer the new field but
  // fall back to the old one so older, already-approved profiles still show.
  const subClan = profile?.sub_clan || profile?.sub_group
  const maritalStatus = profile?.marital_status || profile?.marriage_status
  const qualifications = Array.isArray(profile?.qualifications) ? profile.qualifications : []
  const visionReasons = Array.isArray(profile?.vision_reasons) ? profile.vision_reasons : []

  return (
    <Modal open={open} onClose={onClose} title="Review Application" size="lg">
      {loading || !profile ? (
        <SkeletonText lines={6} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-xl font-semibold text-navy-700">
              {profile.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                profile.full_name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-semibold text-navy-900">{profile.full_name}</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {profile.branch && <Badge tone="navy">{profile.branch}</Badge>}
                {subClan && <Badge tone="gold">{subClan}</Badge>}
                {profile.gender && <Badge tone="grey">{profile.gender}</Badge>}
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-500">
                {profile.email && <p className="flex items-center gap-1.5"><Mail size={12} /> {profile.email}</p>}
                {profile.mobile && <p className="flex items-center gap-1.5"><Phone size={12} /> {profile.mobile}</p>}
                {profile.whatsapp && <p className="flex items-center gap-1.5"><Phone size={12} /> {profile.whatsapp} (WhatsApp)</p>}
                {profile.address && <p className="flex items-center gap-1.5"><MapPin size={12} /> {profile.address}</p>}
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-navy-900">Personal Details</h4>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Field label="Date of Birth" value={profile.dob} />
              <Field label="Blood Group" value={profile.blood_group} />
              <Field label="Marital Status" value={maritalStatus} />
              <Field label="City" value={profile.city} />
              <Field label="District" value={profile.district} />
              <Field label="Province" value={profile.province} />
              <Field label="Country" value={profile.country} />
              <Field label="Village" value={profile.village} />
              <Field label="Facebook" value={profile.facebook_url} />
            </dl>
          </div>

          {/* Community / Lineage Details */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-navy-900">Community &amp; Lineage Details</h4>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Field label="Native Place" value={profile.native_place} />
              <Field label="Kula Deivam" value={profile.kula_deivam} />
              <Field label="Kula Deivam Place" value={profile.kula_deivam_place} />
              <Field label="Kaval Deivam" value={profile.kaval_deivam} />
              <Field label="Kaval Deivam Place" value={profile.kaval_deivam_place} />
              <Field label="Gothram" value={profile.gothram} />
              <Field label="Title (Pattam)" value={profile.title} />
              <Field label="Father's Name" value={profile.father_name} />
              <Field label="Father's Birth Place" value={profile.father_birth_place} />
              <Field label="Grandfather's Name" value={profile.grandfather_name} />
              <Field label="Grandfather's Birth Place" value={profile.grandfather_birth_place} />
              <Field label="Great-Grandfather's Name" value={profile.great_grandfather_name} />
              <Field label="Great-Grandfather's Birth Place" value={profile.great_grandfather_birth_place} />
              <Field label="Applicant's Birth Place" value={profile.birth_place} />
              <Field label="Applicant's Birth Country" value={profile.birth_country} />
            </dl>
          </div>

          {/* Professional / Education */}
          {(qualifications.length > 0 || profile.occupation || profile.professional_category || profile.business_name || profile.doctor_hospital || profile.bank_name || profile.teacher_school) && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-navy-900">Education &amp; Profession</h4>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <Field label="Education" value={profile.education} />
                <Field label="Qualifications" value={qualifications.join(', ')} />
                <Field label="Occupation" value={profile.occupation} />
                <Field label="Professional Category" value={profile.professional_category} />
                <Field label="Business Name" value={profile.business_name} />
                <Field label="Business City" value={profile.business_city} />
                <Field label="Business Nature" value={profile.business_nature} />
                <Field label="Hospital / Where" value={profile.doctor_hospital} />
                <Field label="Bank / Where" value={profile.bank_name} />
                <Field label="Bank Position" value={profile.bank_position} />
                <Field label="School / Institution" value={profile.teacher_school} />
              </dl>
            </div>
          )}

          {/* Marriage & Spouse */}
          {maritalStatus === 'married' && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-navy-900">Marriage &amp; Spouse Details</h4>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <Field label="Marriage Date" value={profile.marriage_date} />
                <Field label="Spouse Name" value={profile.spouse_full_name} />
                <Field label="Spouse is Mukkulathor" value={profile.spouse_is_mukkulathor === true ? 'Yes' : profile.spouse_is_mukkulathor === false ? 'No' : null} />
                <Field label="Spouse Branch" value={profile.spouse_lineage?.branch} />
                <Field label="Spouse Sub-Clan" value={profile.spouse_lineage?.sub_clan || profile.spouse_lineage?.sub_group} />
                <Field label="Spouse Father's Name" value={profile.spouse_lineage?.father_name} />
              </dl>
            </div>
          )}

          {/* Vision to Join */}
          {visionReasons.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-navy-900">Vision to Join</h4>
              <div className="flex flex-wrap gap-1.5">
                {visionReasons.map((reason) => <Badge key={reason} tone="grey">{reason}</Badge>)}
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-sm font-semibold text-navy-900">Family Members ({detail.family?.length ?? 0})</h4>
            {detail.family?.length ? (
              <ul className="space-y-1.5">
                {detail.family.map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-sm2 bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-700">{m.full_name}</span>
                    <span className="text-xs text-slate-400">{RELATION_LABELS[m.relation_type]}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No family members recorded.</p>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-navy-900">Documents ({detail.documents?.length ?? 0})</h4>
            {detail.documents?.length ? (
              <div className="space-y-2">
                {detail.documents.map((d) => <DocumentRow key={d.id} doc={d} />)}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No supporting documents uploaded.</p>
            )}
          </div>

          {isPending ? (
            <div className="border-t border-slate-100 pt-4">
              <Textarea label="Comments (optional)" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Add any notes for the admin or applicant…" />
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button onClick={() => handleDecide('rejected')} disabled={submitting} className="btn-outline border-red-200 text-red-600 hover:bg-red-50">
                  <X size={15} /> Reject
                </button>
                <button onClick={() => handleDecide('approved')} disabled={submitting} className="btn-primary">
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Recommend
                </button>
              </div>
            </div>
          ) : recommendation && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">
                You already <strong>{recommendation.status === 'approved' ? 'recommended' : 'rejected'}</strong> this applicant
                {recommendation.decided_at && ` on ${new Date(recommendation.decided_at).toLocaleDateString()}`}.
              </p>
              {recommendation.comments && <p className="mt-1 text-sm italic text-slate-400">"{recommendation.comments}"</p>}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}