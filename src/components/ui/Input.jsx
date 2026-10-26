import clsx from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, required, hint, className, id, ...props }, ref) {
  const inputId = id || props.name
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label-field">
          {label} {required && <span className="text-gold-700">*</span>}
        </label>
      )}
      <input ref={ref} id={inputId} className={clsx('input-field', error && 'border-red-400 focus:ring-red-400')} {...props} />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Input