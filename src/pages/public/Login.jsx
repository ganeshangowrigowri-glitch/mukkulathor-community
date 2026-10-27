import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Input from '../../components/ui/Input'

export default function Login() {
  const { loginOrRegister } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ fullName: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await loginOrRegister(form)
    if (error) { setLoading(false); setError(error.message); return }

    const userId = data.session?.user?.id ?? data.user?.id
    const { data: profile } = await supabase
      .from('profiles').select('registration_status, role_id').eq('id', userId).single()

    setLoading(false)
    toast.success(data.isNew ? "You're in! Let's complete your registration." : 'Welcome back!')

    const explicitRedirect = location.state?.from?.pathname
    if (explicitRedirect && explicitRedirect !== '/login') { navigate(explicitRedirect, { replace: true }); return }

    if (!profile || profile.registration_status === 'draft') navigate('/member/register', { replace: true })
    else if (['pending_referee_verification', 'pending_admin_approval', 'rejected', 'suspended'].includes(profile.registration_status)) navigate('/member/status', { replace: true })
    else if (profile.role_id === 3) navigate('/admin/dashboard', { replace: true })
    else if (profile.role_id === 2) navigate('/referee/dashboard', { replace: true })
    else navigate('/member/dashboard', { replace: true })
  }

  return (
    <div className="bg-royal-surface px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-royal-gold/30 bg-white shadow-sm lg:grid-cols-5">
        {/* Left: how it works */}
        <aside className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 px-8 py-10 text-linen-100 lg:col-span-2 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-royal-gold-light">Join the registry</p>
          <h2 className="mt-3 font-headline text-3xl font-bold leading-tight text-white">
          Explore more <span className="text-royal-gold-light">verified.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-linen-100/80">
            Sign in or create your account with just your name and email.
          </p>

          <ol className="mt-8 space-y-5">
            {[
              ['Enter your name and email', "New here? Your account is set up automatically."],
              ['Complete the registration form', 'Add your family lineage, personal details and documents.'],
              ['Referees and admin review', 'Your profile is checked before your membership is approved.'],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-royal-gold bg-royal-maroon text-xs font-bold text-white"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-linen-100/75">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>

        {/* Right: login form */}
        <div className="px-6 py-10 sm:px-10 lg:col-span-3 lg:py-14">
          <span className="inline-block rounded-full bg-white p-0.5 ring-1 ring-royal-gold/30">
            <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="32" fill="#8B1E3F" />
              <path d="M32 12v10M32 22 L20 34 M32 22 L44 34 M20 34 V46 M44 34 V46" stroke="#E5C378" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="32" cy="10" r="3" fill="#E5C378" />
              <circle cx="20" cy="34" r="3" fill="#E5C378" />
              <circle cx="44" cy="34" r="3" fill="#E5C378" />
              <circle cx="20" cy="48" r="3" fill="#E5C378" />
              <circle cx="44" cy="48" r="3" fill="#E5C378" />
            </svg>
          </span>
          <h1 className="mt-4 font-headline text-3xl font-bold text-royal-maroon-deep">Member Login</h1>
          <p className="mt-2 text-sm leading-relaxed text-royal-ink-soft">
            Enter your full name and email. New here? We'll set up your account automatically.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <div className="rounded-sm2 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
            <Input label="Full Name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <Input label="Email Address" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
              {loading ? 'Continuing…' : 'Continue'}
            </button>
            <p className="text-center text-xs text-royal-muted">Returning members: use the exact name and email your account was created with.</p>
          </form>
        </div>
      </div>
    </div>
  )
}
