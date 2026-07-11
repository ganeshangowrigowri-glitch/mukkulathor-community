import { LINEAGE_COUNTRIES } from '../../lib/constants'

/**
 * Simple two-option (Sri Lanka / India) radio group, matching the
 * checkbox pair used next to every name field in the Excel form
 * (Great-Grandfather, Grandfather, Father, Applicant, Kula Deivam,
 * Kaval Deivam).
 *
 * Usage: <CountryRadio label="Birth Country" name={register('...').name} register={register} field="great_grandfather_birth_country" />
 * Simpler usage with react-hook-form's register:
 *   <CountryRadio label="Birth Country" registration={register('great_grandfather_birth_country')} />
 */
export default function CountryRadio({ label, registration, required, error }) {
  return (
    <div>
      {label && (
        <p className="mb-1.5 text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
      )}
      <div className="flex gap-4">
        {LINEAGE_COUNTRIES.map((country) => (
          <label key={country} className="flex items-center gap-2 text-sm text-slate-600">
            <input type="radio" value={country} className="accent-navy-700" {...registration} />
            {country}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
