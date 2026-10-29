import { useCallback, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { useSupabaseQuery } from '../../../hooks/useSupabaseQuery'
import { browseProfiles } from '../../../services/matrimonyService'
import { BRANCHES } from '../../../lib/constants'
import { Card } from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import { SkeletonList } from '../../../components/ui/Skeleton'
import ProfileGrid from '../../../components/matrimony/ProfileGrid'

const EMPTY = { branch: '', ageMin: '', ageMax: '', district: '', veettu: '' }

export default function MatrimonyBrowse() {
  const [form, setForm] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const { data: items, loading, error, refetch } = useSupabaseQuery(
    useCallback(() => browseProfiles(applied), [applied]), [applied], { initialData: [] }
  )

  return (
    <div className="space-y-4">
      <Card>
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
          onSubmit={(e) => { e.preventDefault(); setApplied(form) }}
        >
          <Select label="Clan" value={form.branch} onChange={set('branch')} placeholder="All clans" options={BRANCHES} />
          <Input label="Age from" type="number" min="18" max="80" value={form.ageMin} onChange={set('ageMin')} />
          <Input label="Age to" type="number" min="18" max="80" value={form.ageMax} onChange={set('ageMax')} />
          <Input label="District" value={form.district} onChange={set('district')} />
          <Input label="Veettu Peyar" value={form.veettu} onChange={set('veettu')} />
          <div className="flex items-end gap-2">
            <button className="btn-primary flex-1" type="submit"><Search size={15} /> Search</button>
            <button className="btn-ghost" type="button" onClick={() => { setForm(EMPTY); setApplied(EMPTY) }}>Reset</button>
          </div>
        </form>
        <p className="mt-3 text-xs text-slate-400">
          Profiles are shown by registry code. Same Veettu Peyar as yours is never suggested.
        </p>
      </Card>

      {loading ? (
        <SkeletonList count={3} />
      ) : error ? (
        <ErrorState message={error.message || "Couldn't load profiles."} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="No matching profiles" description="Try widening your filters, or check back later as more members publish." />
      ) : (
        <ProfileGrid items={items} onChanged={refetch} />
      )}
    </div>
  )
}
