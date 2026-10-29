import { useState } from 'react'
import toast from 'react-hot-toast'
import { Lock, Eye, Bell, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateNotificationPreferences, updateDirectoryVisibility } from '../../services/settingsService'
import { Card } from '../../components/ui/Card'
import FadeIn from '../../components/ui/FadeIn'

const DEFAULT_PREFS = { email_notifications: true, event_reminders: true, notice_alerts: true, referee_updates: true }

const PREF_LABELS = {
  email_notifications: 'Email notifications', event_reminders: 'Event reminders',
  notice_alerts: 'Notice alerts', referee_updates: 'Referee status updates',
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex min-h-[44px] items-center justify-between gap-3 py-1">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-navy-700' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  )
}

export default function Settings() {
  const { profile, refreshProfile, user } = useAuth()
  const [prefs, setPrefs] = useState(profile?.notification_preferences || DEFAULT_PREFS)
  const [visible, setVisible] = useState(profile?.is_directory_visible !== false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savingVisibility, setSavingVisibility] = useState(false)


  if (!profile) return null

  async function savePrefs(next) {
    setPrefs(next)
    setSavingPrefs(true)
    try {
      await updateNotificationPreferences(profile.id, next)
      await refreshProfile()
    } catch (err) {
      toast.error(err.message || 'Could not save preferences')
    } finally {
      setSavingPrefs(false)
    }
  }

  async function toggleVisibility(next) {
    setVisible(next)
    setSavingVisibility(true)
    try {
      await updateDirectoryVisibility(profile.id, next)
      await refreshProfile()
      toast.success(next ? 'You are now visible in the member directory' : 'You are now hidden from the member directory')
    } catch (err) {
      toast.error(err.message || 'Could not update visibility')
    } finally {
      setSavingVisibility(false)
    }
  }


  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account, privacy, and notification preferences.</p>
      </FadeIn>

      <FadeIn delay={50}>
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
            <Bell size={18} className="text-navy-700" /> Notification Preferences
          </h3>
          <div className="divide-y divide-slate-100">
            {Object.entries(PREF_LABELS).map(([key, label]) => (
              <ToggleRow key={key} label={label} checked={!!prefs[key]} onChange={(v) => savePrefs({ ...prefs, [key]: v })} />
            ))}
          </div>
          {savingPrefs && <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><Loader2 size={12} className="animate-spin" /> Saving…</p>}
        </Card>
      </FadeIn>

      <FadeIn delay={100}>
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
            <Eye size={18} className="text-navy-700" /> Privacy
          </h3>
          <ToggleRow label="Show my profile in the member directory" checked={visible} onChange={toggleVisibility} />
          {savingVisibility && <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><Loader2 size={12} className="animate-spin" /> Saving…</p>}
          <p className="mt-2 text-xs text-slate-400">
            Referees reviewing your application and the administrator can always see your profile regardless of this setting.
          </p>
        </Card>
      </FadeIn>

      <FadeIn delay={150}>
        <Card>
           <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
            <Lock size={18} className="text-navy-700" /> Account
          </h3>
          <p className="text-sm text-slate-500">Signed in as <span className="font-medium text-slate-700">{user?.email}</span></p>
          <p className="mt-2 text-xs text-slate-400">You sign in with your full name and email</p>
        </Card>
      </FadeIn>
    </div>
  )
}
