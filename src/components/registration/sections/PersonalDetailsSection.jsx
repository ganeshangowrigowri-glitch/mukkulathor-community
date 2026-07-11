import Input from '../../ui/Input'
import Select from '../../ui/Select'
import Textarea from '../../ui/Textarea'
import { GENDERS, MARITAL_STATUSES } from '../../../lib/constants'

export default function PersonalDetailsSection({ register, errors }) {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-semibold text-navy-900">Personal Details</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Your Full Name"
          required
          {...register('full_name', { required: 'Full name is required' })}
          error={errors.full_name?.message}
        />
        <Select
          label="Gender"
          required
          options={GENDERS}
          placeholder="Select gender"
          {...register('gender', { required: 'Required' })}
          error={errors.gender?.message}
        />
        <Select
          label="Marital Status"
          required
          options={MARITAL_STATUSES}
          placeholder="Select status"
          {...register('marital_status', { required: 'Required' })}
          error={errors.marital_status?.message}
        />
        <Input label="City" required {...register('city', { required: 'Required' })} error={errors.city?.message} />
        <Input label="District" required {...register('district', { required: 'Required' })} error={errors.district?.message} />
        <Input label="Province" required {...register('province', { required: 'Required' })} error={errors.province?.message} />
        <Input label="Country" required {...register('country', { required: 'Required' })} error={errors.country?.message} />
        <Input
          label="Contact Number"
          required
          {...register('mobile', { required: 'Required' })}
          error={errors.mobile?.message}
        />
        <Input
          type="email"
          label="Email Address"
          required
          {...register('email', { required: 'Required' })}
          error={errors.email?.message}
        />
        <Input label="WhatsApp Number" {...register('whatsapp')} />
        <Input label="Facebook Profile Link" className="sm:col-span-2" {...register('facebook_url')} />
      </div>

      <Textarea
        label="Full Address"
        required
        {...register('address', { required: 'Required' })}
        error={errors.address?.message}
      />
    </div>
  )
}
