import { Link } from 'react-router-dom'
import { ShieldCheck, GitBranch, CalendarDays, ArrowRight, HeartHandshake } from 'lucide-react'
import ServicesSection from '../../components/public/ServicesSection'
import AchieversSection from '../../components/public/AchieversSection'
import SocietiesSection from '../../components/public/SocietiesSection'

const BRANCHES = [
  { name: 'Kallar', desc: 'Historically associated with martial valor and land stewardship across the southern Tamil plains.' },
  { name: 'Maravar', desc: 'Long recognized for warrior traditions and leadership in the coastal and delta regions.' },
  { name: 'Agamudayar', desc: 'Known for administrative and agrarian heritage spanning generations of family lineages.' },
]

const PILLARS = [
  { icon: HeartHandshake, title: 'Matrimony Within the Community', desc: 'Meet verified Mukkulathor families with shared roots — every profile is referee-checked and admin-approved before it ever appears.' },
  { icon: ShieldCheck, title: 'Verified Membership', desc: 'Every member is verified by referees and approved by the administrator before joining the directory.' },
  { icon: GitBranch, title: 'Family Registry', desc: 'Preserve your lineage — great grandparents to grandchildren — in one searchable family tree.' },
  { icon: CalendarDays, title: 'Events & Notices', desc: 'Stay informed about gatherings, heritage drives, and community announcements.' },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative flex w-full items-end justify-center overflow-hidden border-b border-slate-200 bg-navy-950 sm:items-center"
        style={{ aspectRatio: '1162 / 1353' }}
      >
        <img src="/images/hero-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent sm:bg-gradient-to-r sm:from-navy-950/85 sm:via-navy-950/40 sm:to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:py-0 lg:px-8">
          <div className="max-w-xl">
            <p className="section-eyebrow text-gold-400">A matrimony platform for the Mukkulathor community</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Find your life partner within a community you already trust
            </h1>
            <p className="mt-4 text-base text-slate-200 sm:text-lg">
              Every profile is verified by a referee and approved by an administrator before it's visible —
              so every introduction starts from a place of trust, not guesswork.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-gold px-6 py-3 text-base">
                Start Registration <ArrowRight size={17} />
              </Link>
              <a href="#why-matrimony" className="btn-outline border-white/30 bg-white/5 px-6 py-3 text-base text-white hover:bg-white/10">
                How it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="why-matrimony" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="section-eyebrow">Why families trust us for matrimony</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-navy-900">
          Verified matrimony introductions, rooted in community trust
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="card p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                <p.icon size={20} />
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900">{p.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Branches */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="section-eyebrow">The three branches</p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-navy-900">
            The Mukkulathor community
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {BRANCHES.map((b, i) => (
              <div key={b.name} className="relative overflow-hidden rounded-lg border border-slate-200 p-7">
                <span className="font-mono text-xs text-gold-600">0{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-navy-900">{b.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-navy-900 px-8 py-12 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-display text-2xl font-semibold text-white">Ready to find your match?</h3>
            <p className="mt-2 max-w-md text-slate-300">
              Register in six guided steps — personal, community, family, education, documents, and referees —
              and let a verified referee and admin confirm your profile.
            </p>
          </div>
          <Link to="/register" className="btn-gold shrink-0 px-6 py-3 text-base">
            Start Registration <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <ServicesSection />
      <AchieversSection />
      <SocietiesSection />
    </div>
  )
}
