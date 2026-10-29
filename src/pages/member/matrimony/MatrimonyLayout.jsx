import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { ShieldCheck } from 'lucide-react'
import FadeIn from '../../../components/ui/FadeIn'

const TABS = [
  { to: '/member/matrimony', label: 'Dashboard', end: true },
  { to: '/member/matrimony/browse', label: 'Browse Profiles' },
  { to: '/member/matrimony/my-profile', label: 'My Matrimony Profile' },
  { to: '/member/matrimony/shortlist', label: 'Shortlisted' },
  { to: '/member/matrimony/requests', label: 'Requests' },
  { to: '/member/matrimony/privacy', label: 'Privacy Controls' },
]

export default function MatrimonyLayout() {
  return (
    <div className="space-y-5">
      <FadeIn>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Matrimony</h1>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-500">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gold-600" />
          Visible to approved community members only. Your name, contact number and horoscope details are shared only when you accept an interest.
        </p>
      </FadeIn>
      <nav className="flex gap-1 overflow-x-auto rounded-sm2 bg-slate-100 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              clsx(
                'shrink-0 rounded-[5px] px-3.5 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-white text-navy-800 shadow-sm' : 'text-slate-500 hover:text-navy-700'
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
