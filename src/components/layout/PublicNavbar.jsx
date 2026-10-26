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
    <header className="sticky top-0 z-40 bg-royal-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 rounded-full bg-white p-0.5 ring-1 ring-royal-gold/30">
            <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="32" fill="#8B1E3F"/><path d="M32 12v10M32 22 L20 34 M32 22 L44 34 M20 34 V46 M44 34 V46" stroke="#E5C378" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="32" cy="10" r="3" fill="#E5C378"/><circle cx="20" cy="34" r="3" fill="#E5C378"/><circle cx="44" cy="34" r="3" fill="#E5C378"/><circle cx="20" cy="48" r="3" fill="#E5C378"/><circle cx="44" cy="48" r="3" fill="#E5C378"/></svg>
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-headline text-base font-semibold leading-tight tracking-tight text-royal-maroon sm:text-xl">Sri Lanka Mukkulathor Unity</span>
            <span className="truncate text-[10px] font-semibold uppercase tracking-widest text-royal-gold-dark sm:text-[11px]">Kallar · Maravar · Agamudayar</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `border-b-2 pb-1 text-sm transition-colors ${
                  isActive
                    ? 'border-royal-gold font-semibold text-royal-maroon'
                    : 'border-transparent font-semibold text-royal-ink-soft hover:text-royal-maroon'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          {session ? (
            <Link to={dashboardPath} className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-primary">Join the Registry</Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-royal-maroon hover:bg-royal-high xl:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-royal-gold/20 bg-royal-surface px-4 py-4 shadow-royal-2 xl:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm ${
                    isActive ? 'bg-royal-high font-semibold text-royal-maroon' : 'font-semibold text-royal-ink-soft hover:bg-royal-low'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-royal-gold/20 pt-3">
              {session ? (
                <Link to={dashboardPath} className="btn-primary" onClick={() => setOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-outline" onClick={() => setOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>Join the Registry</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
