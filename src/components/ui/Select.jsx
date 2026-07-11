import clsx from 'clsx'
import { forwardRef } from 'react'

const Select = forwardRef(function Select({ label, error, required, options = [], placeholder, className, id, ...props }, ref) {
  const inputId = id || props.name
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label-field">
          {label} {required && <span className="text-gold-600">*</span>}
        </label>
      )}
      <select ref={ref} id={inputId} className={clsx('input-field', error && 'border-red-400')} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Select