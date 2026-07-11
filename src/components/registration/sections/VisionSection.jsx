import { Controller } from 'react-hook-form'
import { VISION_REASONS } from '../../../lib/constants'

export default function VisionSection({ control }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-navy-900">Your Vision to Join</h2>
      <p className="mt-1 text-sm text-slate-500">Select all reasons that apply to you.</p>
      <Controller
        control={control}
        name="vision_reasons"
        defaultValue={[]}
        render={({ field }) => (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {VISION_REASONS.map((reason) => {
              const checked = field.value?.includes(reason)
              return (
                <label key={reason} className="flex items-center gap-2 rounded-sm2 border border-slate-200 px-3 py-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(field.value || []), reason]
                        : (field.value || []).filter((r) => r !== reason)
                      field.onChange(next)
                    }}
                  />
                  {reason}
                </label>
              )
            })}
          </div>
        )}
      />
    </div>
  )
}
