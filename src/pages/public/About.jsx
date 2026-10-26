import PageHero from '../../components/layout/PageHero'
import { ShieldCheck, GitBranch, Globe2, Users } from 'lucide-react'

export default function About() {
  return (
    <div>
      <PageHero
        eyebrow="About us"
        title="About Sri Lanka Mukkulathor Unity"
        description="A unified platform serving the Kallar, Maravar, and Agamudayar branches of the Thevar community."
      />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-slate max-w-none">
          <p className="text-lg leading-relaxed text-slate-600">
            The Mukkulathor community — encompassing the Kallar, Maravar, and Agamudayar lineages — has shaped the
            social, agrarian, and martial history of the Tamil region for centuries. This platform exists to bring
            that shared heritage into a single, secure, and verifiable digital registry.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            Our membership directory is not open registration — every applicant is reviewed by community referees
            and given final approval by an administrator. This ensures the registry remains a trusted record of
            verified families rather than an open public list.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, title: 'Verified, not open', desc: 'Referee review and admin approval protect the integrity of every record.' },
            { icon: GitBranch, title: 'Lineage-first design', desc: 'Family trees and registry codes keep relatives linked across generations.' },
            { icon: Users, title: 'Member-run referees', desc: 'Trusted, approved members are designated as referees for new applicants.' },
            { icon: Globe2, title: 'Built for the diaspora', desc: 'Families anywhere in the world can register, connect, and stay informed.' },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-navy-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}