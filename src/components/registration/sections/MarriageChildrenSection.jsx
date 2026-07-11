import { useFieldArray, useWatch } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import { GENDERS } from '../../../lib/constants'
import LineageSection from './LineageSection'

export default function MarriageChildrenSection({ register, control }) {
  const maritalStatus = useWatch({ control, name: 'marital_status' })
  const spouseIsMukkulathor = useWatch({ control, name: 'spouse_is_mukkulathor' })
  const isMarried = maritalStatus === 'married'

  const { fields, append, remove } = useFieldArray({ control, name: 'children' })

  return (
    <div className="space-y-6">
      {isMarried && (
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold text-navy-900">Marriage Details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Husband / Wife Name" {...register('spouse_full_name')} />
            <Input label="Family ID" placeholder="e.g. MTC-KAL-000123" {...register('family_id')} />
          </div>

          <div className="rounded-sm2 border border-slate-200 p-4">
            <p className="mb-2 text-sm font-medium text-navy-900">Is your spouse also Mukkulathor?</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="radio" value="yes" {...register('spouse_is_mukkulathor')} /> Yes
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="radio" value="no" {...register('spouse_is_mukkulathor')} /> No
              </label>
            </div>
          </div>

          {spouseIsMukkulathor === 'yes' && (
            <LineageSection register={register} control={control} prefix="spouse_" title="Spouse's Family Lineage" />
          )}
        </div>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold text-navy-900">Children</h2>
        <div className="mt-3 space-y-3">
          {fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
              <Input className="sm:col-span-5" label="Child's Name" {...register(`children.${idx}.full_name`)} />
              <Select className="sm:col-span-3" label="Gender" options={GENDERS} {...register(`children.${idx}.gender`)} />
              <Input className="sm:col-span-3" type="date" label="Date of Birth" {...register(`children.${idx}.dob`)} />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="flex h-10 items-center justify-center rounded-sm2 text-red-400 hover:bg-red-50 hover:text-red-600 sm:col-span-1"
                aria-label="Remove child"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ full_name: '', gender: '', dob: '' })}
            className="btn-outline w-full justify-center sm:w-auto"
          >
            <Plus size={16} /> Add Child
          </button>
        </div>
      </div>
    </div>
  )
}
