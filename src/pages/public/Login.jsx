import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Input from '../../components/ui/Input'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await signIn(form)

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    // Route by current registration status / role so a draft applicant lands
    // back in the wizard instead of an empty dashboard.
    const { data: profile } = await supabase
      .from('profiles')
      .select('registration_status, role_id')
      .eq('id', data.user.id)
      .single()

    setLoading(false)
    toast.success('Welcome back!')

    const explicitRedirect = location.state?.from?.pathname
    if (explicitRedirect && explicitRedirect !== '/login') {
      navigate(explicitRedirect, { replace: true })
      return
    }

    if (!profile || profile.registration_status === 'draft') {
      navigate('/member/register', { replace: true })
    } else if (['pending_referee_verification', 'pending_admin_approval', 'rejected', 'suspended'].includes(profile.registration_status)) {
      navigate('/member/status', { replace: true })
    } else if (profile.role_id === 3) {
      navigate('/admin/dashboard', { replace: true })
    } else if (profile.role_id === 2) {
      navigate('/referee/dashboard', { replace: true })
    } else {
      navigate('/member/dashboard', { replace: true })
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <svg width="44" height="44" viewBox="0 0 64 64" className="mx-auto">
            <rect width="64" height="64" rx="10" fill="#173d5c" />
            <path d="M32 12v10M32 22 L20 34 M32 22 L44 34 M20 34 V46 M44 34 V46" stroke="#cda339" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          <h1 className="mt-4 font-display text-2xl font-semibold text-navy-900">Member Login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your Sri Lanka Mukkulathor Unity account</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          {error && <div className="rounded-sm2 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <Input label="Email Address" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to the community?{' '}
          <Link to="/register" className="font-medium text-navy-700 hover:underline">
            Start your registration
          </Link>
        </p>
      </div>
    </div>
  )
}