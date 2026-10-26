import clsx from 'clsx'
import { forwardRef } from 'react'

const Textarea = forwardRef(function Textarea({ label, error, required, className, id, rows = 4, ...props }, ref) {
  const inputId = id || props.name
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label-field">
          {label} {required && <span className="text-gold-700">*</span>}
        </label>
      )}
      <textarea ref={ref} id={inputId} rows={rows} className={clsx('input-field resize-y', error && 'border-red-400 focus:ring-red-400')} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Textarea