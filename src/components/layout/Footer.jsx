import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-navy-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <h4 className="font-display text-xl font-semibold text-white">Sri Lanka Mukkulathor Unity</h4>
          <p className="mt-3 text-sm text-slate-400">
            A verified registry preserving the lineage, history, and unity of the Kallar, Maravar and Agamudayar branches of the Thevar community.
          </p>
        </div>
        <div>
          <h5 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-500">Explore</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white">About Community</Link></li>
            <li><Link to="/history" className="hover:text-white">Community History</Link></li>
            <li><Link to="/objectives" className="hover:text-white">Objectives</Link></li>
            <li><Link to="/events" className="hover:text-white">Events</Link></li>
            <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-500">Membership</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register" className="hover:text-white">Register</Link></li>
            <li><Link to="/login" className="hover:text-white">Member Login</Link></li>
            <li><Link to="/contact" className="hover:text-white">Become a Referee</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-500">Contact</h5>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2"><MapPin size={15} />Badulla,Uva,Sri Lanka</li>
            <li className="flex items-center gap-2"><Mail size={15} /> contact@sasatravel27@gmail.com</li>
            <li className="flex items-center gap-2"><Phone size={15} /> +94 773444462</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Sri Lanka Mukkulathor Unity. All rights reserved.
      </div>
    </footer>
  )
}
