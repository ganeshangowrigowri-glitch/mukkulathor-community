import { useState } from 'react'
import { useWatch, useController } from 'react-hook-form'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import CountryRadio from '../../ui/CountryRadio'
import { BRANCHES, SUB_CLANS_BY_BRANCH, TITLES_BY_BRANCH, GOTHRAMS } from '../../../lib/constants'

const OTHER = '__other__'

function toOptions(list) {
  return list.map((v) => ({ value: v, label: v }))
}

// Dropdown options plus an "Other" entry at the end
function withOther(list) {
  return [...toOptions(list), { value: OTHER, label: 'Other' }]
}

/**
 * Renders the full lineage block from the Excel form:
 *   Great-Grandfather Name / Birth Country / Birth Place
 *   Family Tree Name (Great-Grandfather only)
 *   Grandfather Name / Birth Country / Birth Place / City
 *   Branch (Kilai) / Sub-Clan (Piriu) / Title (Pattam)
 *   Kula Deivam / Country / Temple Place
 *   Kaval Deivam / Country / Temple Place
 *   Gothram
 *   Father Name / Birth Country / Birth Place
 *   Applicant Birth Country / Birth Place
 *
 * `prefix` namespaces the field names so the same section can be
 * reused for the applicant (prefix = '') and, when married, the
 * spouse (prefix = 'spouse_').
 */
export default function LineageSection({ register, control, prefix = '', title }) {
  const branch = useWatch({ control, name: `${prefix}branch` })

  const subClanList = branch ? SUB_CLANS_BY_BRANCH[branch] || [] : []
  const titleList = branch ? TITLES_BY_BRANCH[branch] || [] : []
  const subClanOptions = branch ? withOther(subClanList) : []
  const titleOptions = branch ? withOther(titleList) : []

  const { field: subClanField } = useController({ control, name: `${prefix}sub_clan` })
   const { field: titleField } = useController({ control, name: `${prefix}title` })
  const { field: gothramField } = useController({ control, name: `${prefix}gothram` })

  // Start in "Other" mode if a saved value isn't in the dropdown list
  const [subClanOther, setSubClanOther] = useState(
    !!subClanField.value && !subClanList.includes(subClanField.value)
  )
  const [titleOther, setTitleOther] = useState(
    !!titleField.value && !titleList.includes(titleField.value)
  )

  function handleSubClanSelect(e) {
    const v = e.target.value
    if (v === OTHER) {
      setSubClanOther(true)
      subClanField.onChange('')
    } else {
      setSubClanOther(false)
      subClanField.onChange(v)
    }
  }

  function handleTitleSelect(e) {
    const v = e.target.value
    if (v === OTHER) {
      setTitleOther(true)
      titleField.onChange('')
    } else {
      setTitleOther(false)
      titleField.onChange(v)
    }
  }
    const [gothramOther, setGothramOther] = useState(
    !!gothramField.value && !GOTHRAMS.includes(gothramField.value)
  )

  function handleGothramSelect(e) {
    const v = e.target.value
    if (v === OTHER) {
      setGothramOther(true)
      gothramField.onChange('')
    } else {
      setGothramOther(false)
      gothramField.onChange(v)
    }
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="font-display text-lg font-semibold text-navy-900">{title}</h2>}

      {/* Great-Grandfather */}
      <div className="rounded-sm2 border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-navy-800">Great-Grandfather</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Great-Grandfather's Name" {...register(`${prefix}great_grandfather_name`)} />
          <Input label="Birth Place / City" {...register(`${prefix}great_grandfather_birth_place`)} />
          <CountryRadio label="Birth Country" registration={register(`${prefix}great_grandfather_birth_country`)} />
          <Input
            label="Family Tree Name (if recorded differently)"
            placeholder="Name as it appears in the family tree, if different"
            {...register(`${prefix}great_grandfather_family_tree_name`)}
          />
        </div>
      </div>

      {/* Grandfather */}
      <div className="rounded-sm2 border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-navy-800">Grandfather</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Grandfather's Name" {...register(`${prefix}grandfather_name`)} />
          <Input label="Birth Place / City" {...register(`${prefix}grandfather_birth_place`)} />
          <CountryRadio label="Birth Country" registration={register(`${prefix}grandfather_birth_country`)} />
          <Input label="City" {...register(`${prefix}grandfather_city`)} />
        </div>
      </div>

      {/* Branch / Sub-clan / Title */}
      <div className="rounded-sm2 border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-navy-800">Branch, Sub-Clan &amp; Title</h3>
                <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Branch (Kilai)" options={BRANCHES} placeholder="Select branch" {...register(`${prefix}branch`)} />
          <Select
            label="Sub-Clan (Piriu)"
            options={subClanOptions}
            placeholder={branch ? 'Select sub-clan' : 'Select a branch first'}
            disabled={!branch}
            value={subClanOther ? OTHER : subClanField.value || ''}
            onChange={handleSubClanSelect}
            onBlur={subClanField.onBlur}
          />
          <Select
            label="Title (Pattam)"
            options={titleOptions}
            placeholder={branch ? 'Select title' : 'Select a branch first'}
            disabled={!branch}
            value={titleOther ? OTHER : titleField.value || ''}
            onChange={handleTitleSelect}
            onBlur={titleField.onBlur}
          />
          {subClanOther && (
            <Input
              label="Type your Sub-Clan (Piriu)"
              placeholder="Enter your sub-clan"
              value={subClanField.value || ''}
              onChange={subClanField.onChange}
              onBlur={subClanField.onBlur}
            />
          )}
          {titleOther && (
            <Input
              label="Type your Title (Pattam)"
              placeholder="Enter your title"
              value={titleField.value || ''}
              onChange={titleField.onChange}
              onBlur={titleField.onBlur}
            />
          )}
        </div>
      </div>

      {/* Deities */}
      <div className="rounded-sm2 border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-navy-800">Family Deities</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Kula Deivam (Family Deity)" {...register(`${prefix}kula_deivam`)} />
          <Input label="Kula Deivam — Temple / Kovil Place" {...register(`${prefix}kula_deivam_place`)} />
          <CountryRadio label="Kula Deivam Temple Country" registration={register(`${prefix}kula_deivam_country`)} />
          <div />
          <Input label="Kaval Deivam (Guardian Deity)" {...register(`${prefix}kaval_deivam`)} />
          <Input label="Kaval Deivam — Temple / Kovil Place" {...register(`${prefix}kaval_deivam_place`)} />
          <CountryRadio label="Kaval Deivam Temple Country" registration={register(`${prefix}kaval_deivam_country`)} />
        </div>
      </div>

         {/* Gothram */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Gothram"
          options={withOther(GOTHRAMS)}
          placeholder="Select gothram"
          value={gothramOther ? OTHER : gothramField.value || ''}
          onChange={handleGothramSelect}
          onBlur={gothramField.onBlur}
        />
        {gothramOther && (
          <Input
            label="Type your Gothram"
            placeholder="Enter your gothram"
            value={gothramField.value || ''}
            onChange={gothramField.onChange}
            onBlur={gothramField.onBlur}
          />
        )}
      </div>

      {/* Father */}
      <div className="rounded-sm2 border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-navy-800">Father</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Father's Name" {...register(`${prefix}father_name`)} />
          <Input label="Birth Place / City" {...register(`${prefix}father_birth_place`)} />
          <CountryRadio label="Birth Country" registration={register(`${prefix}father_birth_country`)} />
        </div>
      </div>

      {/* Applicant's own birth details (last link in the chain) */}
      <div className="rounded-sm2 border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-navy-800">{prefix ? "Spouse's Birth Details" : 'Your Birth Details'}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Birth Place / City" {...register(`${prefix}birth_place`)} />
          <CountryRadio label="Birth Country" registration={register(`${prefix}birth_country`)} />
        </div>
      </div>
    </div>
  )
}
