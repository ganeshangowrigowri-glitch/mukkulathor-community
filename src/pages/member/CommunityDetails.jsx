import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../services/profileService'
import EditableSection from '../../components/dashboard/EditableSection'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import FadeIn from '../../components/ui/FadeIn'
import Badge from '../../components/ui/Badge'
import { BRANCHES } from '../../lib/constants'

export default function CommunityDetails() {
  const { profile, refreshProfile } = useAuth()
  if (!profile) return null

  async function save(updates) {
    await updateProfile(profile.id, updates)
    await refreshProfile()
  }

  const branchLabel = BRANCHES.find((b) => b.value === profile.branch)?.label

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Community Details</h1>
        <p className="mt-1 text-sm text-slate-500">Your branch, lineage, and regional roots within the Mukkulathor community.</p>
      </FadeIn>

      <FadeIn delay={50} className="card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
          <ShieldCheck size={26} />
        </div>
        <div>
          <p className="font-display text-xl font-semibold text-navy-900">{profile.community || 'Mukkulathor'}</p>
          <div className="mt-1.5 flex flex-wrap justify-center gap-2 sm:justify-start">
            {branchLabel && <Badge tone="navy">{branchLabel}</Badge>}
            {profile.sub_group && <Badge tone="gold">{profile.sub_group}</Badge>}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <EditableSection
          title="Lineage & Branch"
          description="This determines your placement within the Mukkulathor registry."
          values={{ branch: profile.branch, sub_group: profile.sub_group, kula_deivam: profile.kula_deivam }}
          onSave={save}
          renderView={(v) => (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div><dt className="text-xs text-slate-400">Branch</dt><dd className="mt-0.5 text-sm font-medium capitalize text-slate-800">{v.branch || '—'}</dd></div>
              <div><dt className="text-xs text-slate-400">Pattam / Clan</dt><dd className="mt-0.5 text-sm font-medium text-slate-800">{v.sub_group || '—'}</dd></div>
              <div><dt className="text-xs text-slate-400">Kula Deivam</dt><dd className="mt-0.5 text-sm font-medium text-slate-800">{v.kula_deivam || '—'}</dd></div>
            </dl>
          )}
          renderForm={(draft, setDraft) => (
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Branch" options={BRANCHES} value={draft.branch || ''} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} />
              <Input label="Pattam / Clan" value={draft.sub_group || ''} onChange={(e) => setDraft({ ...draft, sub_group: e.target.value })} />
              <Input label="Kula Deivam" value={draft.kula_deivam || ''} onChange={(e) => setDraft({ ...draft, kula_deivam: e.target.value })} />
            </div>
          )}
        />
      </FadeIn>

      <FadeIn delay={150}>
        <EditableSection
          title="Native Place & Region"
          values={{ native_place: profile.native_place, district: profile.district, country: profile.country, religion: profile.religion }}
          onSave={save}
          renderView={(v) => (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><dt className="text-xs text-slate-400">Native Place</dt><dd className="mt-0.5 text-sm font-medium text-slate-800">{v.native_place || '—'}</dd></div>
              <div><dt className="text-xs text-slate-400">District</dt><dd className="mt-0.5 text-sm font-medium text-slate-800">{v.district || '—'}</dd></div>
              <div><dt className="text-xs text-slate-400">Country</dt><dd className="mt-0.5 text-sm font-medium text-slate-800">{v.country || '—'}</dd></div>
              <div><dt className="text-xs text-slate-400">Religion</dt><dd className="mt-0.5 text-sm font-medium text-slate-800">{v.religion || '—'}</dd></div>
            </dl>
          )}
          renderForm={(draft, setDraft) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Native Place" value={draft.native_place || ''} onChange={(e) => setDraft({ ...draft, native_place: e.target.value })} />
              <Input label="District" value={draft.district || ''} onChange={(e) => setDraft({ ...draft, district: e.target.value })} />
              <Input label="Country" value={draft.country || ''} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
              <Input label="Religion" value={draft.religion || ''} onChange={(e) => setDraft({ ...draft, religion: e.target.value })} />
            </div>
          )}
        />
      </FadeIn>
    </div>
  )
}
