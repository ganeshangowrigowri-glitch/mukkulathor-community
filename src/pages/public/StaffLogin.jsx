import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { staffLogin } from '../../services/staffAuth'
import Input from '../../components/ui/Input'

const PORTALS = {
  admin: { title: 'Admin Login', role: 'admin', home: '/admin/dashboard', text: 'Enter your administrator username and password.' },
  referee: { title: 'Referee Login', role: 'referee', home: '/referee/dashboard', text: 'Use the username and password given to you by the administrator.' },
}

export default function StaffLogin({ portal }) {
  const cfg = PORTALS[portal]
  const { role, profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Once the session and profile are loaded and the role matches this portal, open the dashboard
  useEffect(() => {
    if (profile && role === cfg.role) navigate(cfg.home, { replace: true })
  }, [profile, role, cfg, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: loginError } = await staffLogin({ ...form, portal })
    setLoading(false)
    if (loginError) { setError(loginError.message); return }
    toast.success('Welcome back!')
  }

  return (
    <div className="bg-royal-surface px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-md rounded-2xl border border-royal-gold/30 bg-white p-8 shadow-sm">
        <h1 className="font-headline text-3xl font-bold text-royal-maroon-deep">{cfg.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-royal-ink-soft">{cfg.text}</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <div className="rounded-sm2 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <Input label="Username" required autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input label="Password" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}