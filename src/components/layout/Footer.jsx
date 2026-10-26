import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, ChevronRight } from 'lucide-react'

const linkClass = 'text-royal-rose transition-colors hover:text-royal-gold-light'

const explore = [
  { to: '/about', label: 'About Community' },
  { to: '/history', label: 'Community History' },
  { to: '/objectives', label: 'Objectives' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
]

const membership = [
  { to: '/register', label: 'Register' },
  { to: '/login', label: 'Member Login' },
  { to: '/contact', label: 'Become a Referee' },
]

export default function Footer() {
  return (
    <footer className="bg-royal-dark pb-10 pt-16 text-royal-linen shadow-[inset_0_1px_1px_0_rgba(229,195,120,0.2)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="shrink-0 rounded-full bg-royal-maroon p-0.5 ring-1 ring-royal-gold/50">
                <svg width="32" height="32" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="32" fill="#8B1E3F"/><path d="M32 12v10M32 22 L20 34 M32 22 L44 34 M20 34 V46 M44 34 V46" stroke="#E5C378" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="32" cy="10" r="3" fill="#E5C378"/><circle cx="20" cy="34" r="3" fill="#E5C378"/><circle cx="44" cy="34" r="3" fill="#E5C378"/><circle cx="20" cy="48" r="3" fill="#E5C378"/><circle cx="44" cy="48" r="3" fill="#E5C378"/></svg>
              </span>
              <span className="flex flex-col">
                <span className="font-headline text-lg font-semibold leading-tight tracking-tight text-royal-gold-light">Sri Lanka Mukkulathor Unity</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-royal-rose">Kallar · Maravar · Agamudayar</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-royal-rose/90">
              A verified registry preserving the lineage, history, and unity of the Kallar, Maravar and Agamudayar branches of the Thevar community.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-headline text-xl font-semibold tracking-tight text-royal-gold-light">Explore</h4>
            <ul className="space-y-2 text-sm">
              {explore.map((l) => (
                <li key={l.to} className="flex items-center gap-1">
                  <ChevronRight size={16} className="text-royal-gold" aria-hidden="true" />
                  <Link to={l.to} className={linkClass}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-headline text-xl font-semibold tracking-tight text-royal-gold-light">Membership</h4>
            <ul className="space-y-2 text-sm">
              {membership.map((l) => (
                <li key={l.to} className="flex items-center gap-1">
                  <ChevronRight size={16} className="text-royal-gold" aria-hidden="true" />
                  <Link to={l.to} className={linkClass}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-headline text-xl font-semibold tracking-tight text-royal-gold-light">Contact</h4>
            <ul className="space-y-3 text-sm text-royal-rose">
              <li className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-royal-gold" aria-hidden="true" /> Badulla, Uva, Sri Lanka</li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-royal-gold" aria-hidden="true" />
                {/* The old text was "contact@sasatravel27@gmail.com" (two @ signs). Confirm this is the right address. */}
                <a href="mailto:sasatravel27@gmail.com" className="transition-colors hover:text-royal-gold-light">sasatravel27@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-royal-gold" aria-hidden="true" />
                <a href="tel:+94773444462" className="transition-colors hover:text-royal-gold-light">+94 773444462</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-royal-gold/20 pt-6 text-center text-xs font-semibold text-royal-rose/70 sm:text-left">
          © {new Date().getFullYear()} Sri Lanka Mukkulathor Unity. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
