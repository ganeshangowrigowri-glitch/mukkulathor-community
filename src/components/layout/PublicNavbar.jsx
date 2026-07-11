import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/history', label: 'History' },
  { to: '/objectives', label: 'Objectives' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
]

export default function PublicNavbar() {
  const [open, setOpen] = useState(false)
  const { session, role } = useAuth()
  const dashboardPath = role === 'admin' ? '/admin/dashboard' : role === 'referee' ? '/referee/dashboard' : '/member/dashboard'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <svg width="34" height="34" viewBox="0 0 64 64" className="shrink-0"><rect width="64" height="64" rx="10" fill="#173d5c"/><path d="M32 12v10M32 22 L20 34 M32 22 L44 34 M20 34 V46 M44 34 V46" stroke="#cda339" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="32" cy="10" r="3" fill="#cda339"/><circle cx="20" cy="34" r="3" fill="#cda339"/><circle cx="44" cy="34" r="3" fill="#cda339"/><circle cx="20" cy="48" r="3" fill="#cda339"/><circle cx="44" cy="48" r="3" fill="#cda339"/></svg>
          <span className="min-w-0 truncate font-display text-base font-semibold leading-tight text-navy-900 sm:text-lg">
             Sri Lanka Mukkulathor Unity<span className="block truncate text-[11px] font-sans font-medium tracking-wide text-gold-600 sm:text-xs">Kallar · Maravar · Agamudayar</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-navy-800' : 'text-slate-500 hover:text-navy-700'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <Link to={dashboardPath} className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-gold">Join the Registry</Link>
            </>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600">
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {session ? (
                <Link to={dashboardPath} className="btn-primary" onClick={() => setOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-outline" onClick={() => setOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-gold" onClick={() => setOpen(false)}>Join the Registry</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
