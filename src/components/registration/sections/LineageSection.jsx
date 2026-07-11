import { useWatch } from 'react-hook-form'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import CountryRadio from '../../ui/CountryRadio'
import { BRANCHES, SUB_CLANS_BY_BRANCH, TITLES_BY_BRANCH, GOTHRAMS } from '../../../lib/constants'

function toOptions(list) {
  return list.map((v) => ({ value: v, label: v }))
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
  const subClanOptions = branch ? toOptions(SUB_CLANS_BY_BRANCH[branch] || []) : []
  const titleOptions = branch ? toOptions(TITLES_BY_BRANCH[branch] || []) : []

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
            {...register(`${prefix}sub_clan`)}
          />
          <Select
            label="Title (Pattam)"
            options={titleOptions}
            placeholder={branch ? 'Select title' : 'Select a branch first'}
            disabled={!branch}
            {...register(`${prefix}title`)}
          />
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
        <Select label="Gothram" options={toOptions(GOTHRAMS)} placeholder="Select gothram" {...register(`${prefix}gothram`)} />
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
