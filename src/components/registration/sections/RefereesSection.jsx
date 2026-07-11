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
                <div>
                  <p className="text-sm font-semibold text-navy-900">{ref.profiles?.full_name}</p>
                  <p className="text-xs text-slate-500">
                    {ref.designation || 'Referee'} {ref.region ? `· ${ref.region}` : ''}
                  </p>
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
