import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      mobile: form.mobile,
    })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    toast.success('Account created! Check your email to verify, then continue your registration.')
    navigate('/login')
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <svg width="44" height="44" viewBox="0 0 64 64" className="mx-auto">
            <rect width="64" height="64" rx="10" fill="#173d5c" />
            <path d="M32 12v10M32 22 L20 34 M32 22 L44 34 M20 34 V46 M44 34 V46" stroke="#cda339" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          <h1 className="mt-4 font-display text-2xl font-semibold text-navy-900">Create Your Account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Step 1 of joining the registry — after verifying your email, you'll complete a 6-step membership form.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          {error && <div className="rounded-sm2 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <Input label="Full Name" required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
          <Input label="Email Address" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
          <Input label="Mobile Number" required value={form.mobile} onChange={(e) => update('mobile', e.target.value)} />
          <Input label="Password" type="password" required hint="At least 8 characters" value={form.password} onChange={(e) => update('password', e.target.value)} />
          <Input label="Confirm Password" type="password" required value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
          <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
            {loading ? 'Creating account…' : 'Create Account & Continue'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already a member?{' '}
          <Link to="/login" className="font-medium text-navy-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
