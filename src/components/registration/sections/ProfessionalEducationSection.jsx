import { Controller, useWatch } from 'react-hook-form'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import {
  QUALIFICATION_LEVELS,
  PROFESSIONAL_CATEGORIES,
  BUSINESS_NATURE_OPTIONS,
  BANK_POSITION_OPTIONS,
} from '../../../lib/constants'

export default function ProfessionalEducationSection({ register, control }) {
  const category = useWatch({ control, name: 'professional_category' })
  const selectedQualifications = useWatch({ control, name: 'qualifications' }) || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-navy-900">Qualification</h2>
        <p className="mt-1 text-sm text-slate-500">Select every qualification that applies, and enter the institution for each.</p>
        <Controller
          control={control}
          name="qualifications"
          defaultValue={[]}
          render={({ field }) => (
            <div className="mt-3 space-y-3">
              {QUALIFICATION_LEVELS.map((level) => {
                const checked = field.value?.includes(level.value)
                return (
                  <div key={level.value} className="rounded-sm2 border border-slate-200 p-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...(field.value || []), level.value]
                            : (field.value || []).filter((v) => v !== level.value)
                          field.onChange(next)
                        }}
                      />
                      {level.label}
                    </label>
                    {checked && (
                      <Input
                        className="mt-2"
                        placeholder={level.placeholder}
                        {...register(`qualification_institutions.${level.value}`)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        />
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-navy-900">Professional Details</h2>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <Select label="Category" options={PROFESSIONAL_CATEGORIES} placeholder="Select category" {...register('professional_category')} />

          {category === 'business' && (
            <>
              <Input label="Business Name" {...register('business_name')} />
              <Input label="City" {...register('business_city')} />
              <Select
                label="Nature of Business"
                options={BUSINESS_NATURE_OPTIONS.map((v) => ({ value: v, label: v }))}
                placeholder="Select nature of business"
                {...register('business_nature')}
              />
            </>
          )}

          {category === 'doctor' && (
            <>
              <Input label="Hospital / Where" {...register('doctor_hospital')} />
              <Input label="Organization" {...register('doctor_organization')} />
              <Input label="City" {...register('doctor_city')} />
            </>
          )}

          {category === 'banker' && (
            <>
              <Input label="Bank / Where" {...register('bank_name')} />
              <Input label="Organization" {...register('bank_organization')} />
              <Input label="City" {...register('bank_city')} />
              <Select
                label="Position"
                options={BANK_POSITION_OPTIONS.map((v) => ({ value: v, label: v }))}
                placeholder="Select position"
                {...register('bank_position')}
              />
            </>
          )}

        {category === 'teacher' && (
            <>
              <Input label="School / Institution" {...register('teacher_school')} />
              <Input label="City" {...register('teacher_city')} />
            </>
          )}

          {category === 'other' && (
            <Input label="Profession / Occupation" placeholder="e.g. Engineer, Farmer, Lawyer" {...register('occupation')} />
          )}
        </div>
      </div>
    </div>
  )
}
