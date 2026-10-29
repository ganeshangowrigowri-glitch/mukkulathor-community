import { useCallback, useEffect, useState } from 'react'
import { Download, Phone, ShieldCheck, Lock } from 'lucide-react'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import { SkeletonText } from '../ui/Skeleton'
import ErrorState from '../ui/ErrorState'
import SignedImage from './SignedImage'
import { getMatrimonyProfile, getSignedUrl, MATRIMONY_BUCKETS } from '../../services/matrimonyService'
import { format } from 'date-fns'
import { MATRIMONY_JATHAKAM, MATRIMONY_MARITAL, MATRIMONY_DIET, RELATION_LABELS } from '../../lib/constants'

const labelOf = (list, v) => list.find((x) => x.value === v)?.label

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium capitalize text-slate-800">{value}</dd>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="mb-1 font-display text-base font-semibold text-navy-800">{title}</h4>
      <dl>{children}</dl>
    </div>
  )
}

/** Full profile view. Sensitive fields are only present in the data when the
 *  database has released them (own profile, admin, or accepted connection). */
export default function ProfileDetailModal({ profileId, open, onClose, footer }) {
  const [p, setP] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [horoUrl, setHoroUrl] = useState(null)

  const load = useCallback(async () => {
    if (!profileId) return
    setLoading(true); setError(null); setHoroUrl(null)
    try {
      const data = await getMatrimonyProfile(profileId)
      setP(data)
      if (data?.horoscope_path) setHoroUrl(await getSignedUrl(MATRIMONY_BUCKETS.HOROSCOPES, data.horoscope_path))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => { if (open) load() }, [open, load])

  const released = !!p?.full_name

  return (
    <Modal open={open} onClose={onClose} title={p?.member_code ? `Profile ${p.member_code}` : 'Profile'} size="lg" footer={footer?.(p)}>
      {loading ? (
        <SkeletonText lines={8} />
      ) : error ? (
        <ErrorState message={error.message || "Couldn't load this profile."} onRetry={load} />
      ) : !p ? (
        <p className="text-sm text-slate-500">This profile is not available.</p>
      ) : (
        <div className="space-y-5">
          <div className="flex gap-4">
            {p.photo_path ? (
              <SignedImage bucket={MATRIMONY_BUCKETS.PHOTOS} path={p.photo_path} className="h-28 w-28 shrink-0 rounded-xl" />
            ) : (
              <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-linen-100 text-center text-xs text-slate-400">
                <Lock size={18} /> Photo private
              </div>
            )}
            <div className="space-y-1">
              <p className="font-display text-xl font-semibold text-navy-900">{released ? p.full_name : p.member_code}</p>
             <p className="text-sm text-slate-600">{p.age} yrs{p.height_cm ? ` · ${p.height_cm} cm` : ''} · <span className="capitalize">{p.branch}</span></p>
              {p.member_since && <p className="text-xs text-slate-400">Registered {format(new Date(p.member_since), 'dd MMM yyyy')}{p.approved_at ? ` · Approved ${format(new Date(p.approved_at), 'dd MMM yyyy')}` : ''}</p>}
              <div className="flex flex-wrap gap-1.5">
                {p.jathakam_type && <Badge tone="navy">{labelOf(MATRIMONY_JATHAKAM, p.jathakam_type)}</Badge>}
                {p.is_connected && <Badge tone="green"><ShieldCheck size={12} /> Connected</Badge>}
              </div>
            </div>
          </div>

          {released && p.contact_phone && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
              <span className="flex items-center gap-2 text-emerald-800"><Phone size={16} /> Contact shared with you</span>
              <a href={`tel:${p.contact_phone}`} className="font-semibold text-emerald-900 underline">{p.contact_phone}</a>
            </div>
          )}
          {!released && (
            <p className="flex items-start gap-2 rounded-lg bg-linen-100 p-3 text-xs text-slate-600">
              <Lock size={14} className="mt-0.5 shrink-0" />
              Name, contact number and horoscope details are shared only after this member accepts your interest.
            </p>
          )}

          {p.about && <p className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{p.about}</p>}

          <div className="grid gap-5 md:grid-cols-2">
            <Section title="Personal & professional">
              <Row label="Marital status" value={labelOf(MATRIMONY_MARITAL, p.marital_status)} />
              <Row label="Diet" value={labelOf(MATRIMONY_DIET, p.diet)} />
              <Row label="Education" value={p.education_summary} />
              <Row label="Occupation" value={p.occupation_title} />
              <Row label="Employer" value={p.employer} />
              <Row label="District" value={p.district} />
            </Section>
            <Section title="Lineage">
              <Row label="Veettu Peyar" value={p.veettu_peyar} />
              <Row label="Kootam / Gothram" value={p.kootam} />
              <Row label="Kula Deivam" value={p.kula_deivam} />
              <Row label="Ancestral home" value={p.native_place} />
            </Section>
            <Section title="Horoscope (Jathakam)">
              <Row label="Type" value={labelOf(MATRIMONY_JATHAKAM, p.jathakam_type)} />
              <Row label="Rasi" value={p.rasi} />
              <Row label="Nakshatram" value={p.nakshatram} />
              <Row label="Padam" value={p.padam} />
              <Row label="Dosham note" value={p.dosham_note} />
              {horoUrl && (
                <a href={horoUrl} target="_blank" rel="noreferrer" className="btn-outline mt-2">
                  <Download size={15} /> Open horoscope file
                </a>
              )}
            </Section>
            <Section title="Partner preferences">
              <Row label="Age" value={p.pref_age_min || p.pref_age_max ? `${p.pref_age_min ?? '—'} to ${p.pref_age_max ?? '—'}` : null} />
              <Row label="Clan" value={p.pref_branches?.join(', ')} />
              <Row label="Education" value={p.pref_education} />
              <Row label="Location" value={p.pref_location} />
                            <Row label="Notes" value={p.pref_notes} />
            </Section>
            <Section title="Community details">
              <Row label="Clan" value={p.branch} />
              <Row label="Sub-clan" value={p.sub_clan} />
              <Row label="Title (Pattam)" value={p.title} />
              <Row label="Kaval Deivam" value={p.kaval_deivam} />
              <Row label="Province" value={p.province} />
              <Row label="Country" value={p.country} />
            </Section>
            <Section title="Education & profession">
              <Row label="Qualifications" value={Array.isArray(p.qualifications) ? p.qualifications.join(', ') : null} />
              <Row label="Category" value={p.professional_category} />
              <Row label="Works at" value={p.workplace} />
            </Section>
            {released && (p.email || p.whatsapp || p.facebook_url || p.address || p.dob || p.blood_group || p.family_id) && (
              <Section title="Contact & registration">
                <Row label="E-mail" value={p.email} />
                <Row label="WhatsApp" value={p.whatsapp} />
                <Row label="Facebook" value={p.facebook_url} />
                <Row label="Address" value={[p.address, p.city].filter(Boolean).join(', ')} />
                <Row label="Date of birth" value={p.dob} />
                <Row label="Blood group" value={p.blood_group} />
                <Row label="Family ID" value={p.family_id} />
              </Section>
            )}
          {released && (p.father_name || p.grandfather_name || p.great_grandfather_name) && (
              <Section title="Family details">
                <Row label="Father" value={p.father_name} />
                <Row label="Grandfather" value={p.grandfather_name} />
                <Row label="Great-grandfather" value={p.great_grandfather_name} />
              </Section>
            )}
          </div>

          {Array.isArray(p.vision_reasons) && p.vision_reasons.length > 0 && (
            <div>
              <h4 className="mb-1 font-display text-base font-semibold text-navy-800">Vision to join</h4>
              <div className="flex flex-wrap gap-1.5">
                {p.vision_reasons.map((v) => <Badge key={v} tone="grey">{v}</Badge>)}
              </div>
            </div>
          )}

          {released && Array.isArray(p.family_tree) && p.family_tree.length > 0 && (
            <div>
              <h4 className="mb-1 font-display text-base font-semibold text-navy-800">Family tree</h4>
              <div className="space-y-1.5">
                {[...new Set(p.family_tree.map((n) => n.generation_level))].sort((a, b) => a - b).map((gen) => (
                  <div key={gen} className="flex flex-wrap gap-2">
                    {p.family_tree.filter((n) => n.generation_level === gen).map((n) => (
                      <span key={n.member_id} className="rounded-lg bg-linen-100 px-2.5 py-1.5 text-xs text-slate-700">
                        <b>{n.full_name}</b> · {RELATION_LABELS?.[n.relation_type] ?? n.relation_type}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {released && Array.isArray(p.family_members) && p.family_members.length > 0 && (
            <div>
              <h4 className="mb-1 font-display text-base font-semibold text-navy-800">Family members</h4>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {p.family_members.map((m, i) => (
                  <li key={i} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="truncate text-slate-700">{m.full_name}</span>
                    <span className="shrink-0 text-xs text-slate-400">{RELATION_LABELS?.[m.relation_type] ?? m.relation_type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
