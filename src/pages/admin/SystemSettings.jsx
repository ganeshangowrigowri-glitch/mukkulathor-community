import { useCallback, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Cog, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { getSystemSettings, updateSystemSettings } from '../../services/adminService'
import FadeIn from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import { SkeletonText } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex min-h-[44px] items-start justify-between gap-3 py-2">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-navy-700' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function SystemSettings() {
  const { profile } = useAuth()
  const { data: settings, loading, error, refetch } = useSupabaseQuery(useCallback(() => getSystemSettings(), []), [])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateSystemSettings(form, profile.id)
      setForm(updated)
      toast.success('System settings updated')
    } catch (err) {
      toast.error(err.message || 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <SkeletonText lines={10} />
  if (error) return <ErrorState onRetry={refetch} message="Couldn't load system settings." />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <FadeIn>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-navy-900"><Cog size={24} className="text-navy-700" /> System Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Platform-wide configuration for registration and notifications.</p>
      </FadeIn>

      <FadeIn delay={50}>
        <Card>
          <h3 className="mb-4 font-display text-lg font-semibold text-navy-900">Site Information</h3>
          <div className="space-y-4">
            <Input label="Site Name" value={form.site_name || ''} onChange={(e) => setForm({ ...form, site_name: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="email" label="Contact Email" value={form.contact_email || ''} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              <Input label="Contact Phone" value={form.contact_phone || ''} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={100}>
        <Card>
          <h3 className="mb-2 font-display text-lg font-semibold text-navy-900">Registration</h3>
          <div className="divide-y divide-slate-100">
            <ToggleRow
              label="Registration Open"
              description="When off, new applicants cannot start the registration wizard."
              checked={form.registration_open}
              onChange={(v) => setForm({ ...form, registration_open: v })}
            />
            <ToggleRow
              label="Auto-Notify Referees by Email"
              description="Send an email automatically when an applicant selects a referee."
              checked={form.auto_notify_referees}
              onChange={(v) => setForm({ ...form, auto_notify_referees: v })}
            />
          </div>
          <Input
            type="number" min={1} max={5} label="Minimum Referees Required"
            className="mt-4 max-w-[180px]"
            value={form.min_referees_required ?? 1}
            onChange={(e) => setForm({ ...form, min_referees_required: Number(e.target.value) })}
          />
        </Card>
      </FadeIn>

      <FadeIn delay={150}>
        <Card>
          <h3 className="mb-2 font-display text-lg font-semibold text-navy-900">Maintenance</h3>
          <ToggleRow
            label="Maintenance Mode"
            description="Show a maintenance message to visitors instead of the full site."
            checked={form.maintenance_mode}
            onChange={(v) => setForm({ ...form, maintenance_mode: v })}
          />
          {form.maintenance_mode && (
            <Textarea
              label="Maintenance Message" className="mt-3"
              value={form.maintenance_message || ''}
              onChange={(e) => setForm({ ...form, maintenance_message: e.target.value })}
              placeholder="We'll be back shortly…"
            />
          )}
        </Card>
      </FadeIn>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving ? <Loader2 size={15} className="animate-spin" /> : null}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
