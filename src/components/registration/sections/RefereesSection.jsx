import { useEffect, useState } from 'react'
import { UserCheck } from 'lucide-react'
import { listActiveReferees } from '../../../services/refereeService'
import PageLoader from '../../ui/PageLoader'
import EmptyState from '../../ui/EmptyState'

const MAX_REFEREES = 5
const MIN_REFEREES = 1

export default function RefereesSection({ selected, onChange, error }) {
  const [referees, setReferees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listActiveReferees().then((data) => {
      setReferees(data)
      setLoading(false)
    })
  }, [])

  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id))
     } else if (selected.length < MAX_REFEREES) {
      onChange([...selected, id])
    }
  }

  if (loading) return <PageLoader label="Loading available referees…" />

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-navy-900">Referees</h2>
      <p className="mt-1 text-sm text-slate-500">
      Please select at least {MIN_REFEREES} senior member (up to {MAX_REFEREES}) to recommend your application ({selected.length}/{MAX_REFEREES} selected).
        Referees are managed by the community office — if the person you're looking for isn't listed, contact the admin.
      </p>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {referees.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No referees available yet"
          description="The community office hasn't added any referees yet. Please contact the admin or try again later."
        />
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {referees.map((ref) => {
            const isSelected = selected.includes(ref.id)
            const disableUnselected = !isSelected && selected.length >= MAX_REFEREES
            return (
              <label
                key={ref.id}
                className={`flex items-start gap-3 rounded-sm2 border p-4 transition-colors ${
                  isSelected ? 'border-navy-600 bg-navy-50' : 'border-slate-200 hover:border-slate-300'
                } ${disableUnselected ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-navy-700"
                  checked={isSelected}
                  disabled={disableUnselected}
                  onChange={() => toggle(ref.id)}
                />
                   <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100 text-lg font-semibold text-navy-700">
                  {ref.profiles?.profile_photo_url ? (
                    <img src={ref.profiles.profile_photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    ref.profiles?.full_name?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900">{ref.profiles?.full_name}</p>
                  <p className="text-xs text-slate-500">
                    {ref.designation || 'Referee'} {ref.region ? `· ${ref.region}` : ''}
                  </p>
                    {ref.profiles?.occupation && (
                    <p className="text-xs text-slate-500">{ref.profiles.occupation}</p>
                  )}
                  {ref.profiles?.father_name && (
                    <p className="text-xs text-slate-500">Father: {ref.profiles.father_name}</p>
                  )}
                  {(ref.profiles?.kulam || ref.profiles?.gothram || ref.profiles?.caste) && (
                    <p className="text-xs text-slate-500">
                      {[
                        ref.profiles.kulam && `Kulam: ${ref.profiles.kulam}`,
                        ref.profiles.gothram && `Gothram: ${ref.profiles.gothram}`,
                        ref.profiles.caste && `Caste: ${ref.profiles.caste}`,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {(ref.profiles?.address || ref.profiles?.village || ref.profiles?.district) && (
                    <p className="text-xs text-slate-500">
                      {[ref.profiles.address, ref.profiles.village, ref.profiles.district].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <p className="text-xs capitalize text-slate-400">{ref.profiles?.branch}</p>
                </div>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
