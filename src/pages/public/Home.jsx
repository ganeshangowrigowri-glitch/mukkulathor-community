import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  GitBranch,
  CalendarDays,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react'
import ServicesSection from '../../components/public/ServicesSection'
import AchieversSection from '../../components/public/AchieversSection'
import SocietiesSection from '../../components/public/SocietiesSection'

/* ------------------------------------------------------------------ */
/* Editable content — change the text here, not in the JSX below.      */
/* ------------------------------------------------------------------ */

const HERO = {
  // Set `motto` to null to hide the pill. Please confirm the Tamil wording
  // (it came from the Stitch mockup, not from your society).
  motto: {
    ta: 'ஒற்றுமையே நம் பலம்… அறிவே நம் எதிர்காலம்…',
    en: 'Unity is our strength. Knowledge is our future.',
  },
  title: 'A verified registry for the Kallar, Maravar and Agamudayar families of Sri Lanka',
  body: 'Preserve your lineage, connect with verified community families, and keep the history and unity of the community alive for the next generation.',
  assurances: ['Referee-verified', 'Admin-approved', 'Family tree registry'],
}

const PILLARS = [
  { icon: HeartHandshake, title: 'Matrimony Within the Community', desc: 'Meet verified Mukkulathor families with shared roots — every profile is referee-checked and admin-approved before it ever appears.' },
  { icon: ShieldCheck, title: 'Verified Membership', desc: 'Every member is verified by referees and approved by the administrator before joining the directory.' },
  { icon: GitBranch, title: 'Family Registry', desc: 'Preserve your lineage — great grandparents to grandchildren — in one searchable family tree.' },
  { icon: CalendarDays, title: 'Events & Notices', desc: 'Stay informed about gatherings, heritage drives, and community announcements.' },
]

// `ta` = Tamil name (please verify spellings). `image` is optional: put a file in
// public/images/branches/ and set e.g. '/images/branches/kallar.jpg'. Without an
// image the card shows the Tamil name on maroon instead.
const BRANCHES = [
  { name: 'Kallar', ta: 'கள்ளர்', image: null, desc: 'Historically associated with martial valor and land stewardship across the southern Tamil plains.' },
  { name: 'Maravar', ta: 'மறவர்', image: null, desc: 'Long recognized for warrior traditions and leadership in the coastal and delta regions.' },
  { name: 'Agamudayar', ta: 'அகமுடையார்', image: null, desc: 'Known for administrative and agrarian heritage spanning generations of family lineages.' },
]

// These mirror the six steps of the registration wizard, in order.
const STEPS = [
  { title: 'Personal', desc: 'Your name, date of birth, contact details and where you live.' },
  { title: 'Community', desc: 'Your branch and community background.' },
  { title: 'Family', desc: 'Parents, grandparents and wider family lineage.' },
  { title: 'Education', desc: 'Your education and work details.' },
  { title: 'Uploads', desc: 'Your photo and supporting documents.' },
  { title: 'Referees', desc: 'The referees who will recommend you.' },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-linen-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-24">
          <div className="lg:col-span-7">
            {HERO.motto && (
              <p className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-full border border-gold-400/30 bg-white/5 px-4 py-1.5 text-sm text-gold-200">
                <span lang="ta" className="font-medium">{HERO.motto.ta}</span>
                <span className="hidden text-linen-200/60 sm:inline">{HERO.motto.en}</span>
              </p>
            )}
            <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              {HERO.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-linen-200/80">{HERO.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-gold px-6 py-3 text-base">
                Start Registration <ArrowRight size={17} />
              </Link>
              <Link to="/history" className="btn-outline-light px-6 py-3 text-base">
                Explore Community Heritage
              </Link>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gold-200">
              {HERO.assurances.map((a) => (
                <li key={a} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={16} aria-hidden="true" /> {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Society poster in a gold frame */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-sm rounded-2xl border border-gold-400/40 bg-navy-950 p-2 shadow-lifted lg:max-w-none">
              <img
                src="/images/hero-bg.jpg"
                alt="Sri Lanka Mukkulathor Unity society poster"
                width="1162"
                height="1353"
                className="aspect-[1162/1353] w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="why-matrimony" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="section-eyebrow">Why families trust us for matrimony</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
          Verified matrimony introductions, rooted in community trust
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="card p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                <p.icon size={20} />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy-900">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Branches */}
      <section className="border-y border-slate-200 bg-linen-100">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="section-eyebrow">The three branches</p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
            The Mukkulathor community
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {BRANCHES.map((b) => (
              <article key={b.name} className="card overflow-hidden">
                <div className="aspect-[4/3] bg-navy-900">
                  {b.image ? (
                    <img src={b.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950">
                      <span lang="ta" className="font-display text-5xl font-semibold text-gold-300/90">
                        {b.ta}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-semibold text-navy-900">{b.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{b.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Registration steps */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="section-eyebrow">How registration works</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
          Register in six steps
        </h2>
        <p className="mt-3 max-w-xl text-slate-500">
          Fill in the form at your own pace. Your profile is only confirmed once referees and the administrator have reviewed it.
        </p>

        <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
          <div aria-hidden="true" className="absolute left-0 right-0 top-5 hidden h-px bg-navy-200 lg:block" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-4 lg:flex-col lg:gap-3">
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-700 font-semibold text-white ring-4 ring-linen-50">
                {i + 1}
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-navy-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex items-start gap-3 rounded-xl border border-gold-300 bg-gold-50 p-5">
          <CheckCircle2 className="mt-0.5 shrink-0 text-gold-700" size={20} aria-hidden="true" />
          <p className="text-sm leading-relaxed text-slate-700">
            After you submit, a referee recommends you and the administrator approves your profile.
            Then your Member Dashboard unlocks.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-gold-400/30 bg-gradient-to-br from-navy-900 to-navy-950 px-8 py-12 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-display text-3xl font-semibold text-white">Ready to find your match?</h3>
            <p className="mt-2 max-w-md text-linen-200/80">
              Register in six guided steps — personal, community, family, education, documents, and referees —
              and let a verified referee and admin confirm your profile.
            </p>
          </div>
          <Link to="/register" className="btn-gold shrink-0 px-6 py-3 text-base">
            Start Registration <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Admin-managed content from Supabase (unchanged) */}
      <ServicesSection />
      <AchieversSection />
      <SocietiesSection />
    </div>
  )
}