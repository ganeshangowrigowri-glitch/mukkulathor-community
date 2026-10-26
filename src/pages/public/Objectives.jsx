import { useState } from 'react'
import PageHero from '../../components/layout/PageHero'
import { CheckCircle2 } from 'lucide-react'

const OBJECTIVES = [
  {
    text: 'Maintain a secure, verified membership directory of Mukkulathor families worldwide.',
    details: (
      <>
        <p className="mt-2">
          To create an authenticated digital registry of Mukkulathor families in Sri Lanka and across the diaspora.
          This helps ensure transparency, prevent fraud, and protect the rights of genuine members of the Sangam.
        </p>
      </>
    ),
  },
  {
    text: 'Preserve family history through structured family trees and documented lineage records.',
    details: (
      <>
        <p className="mt-2">
          To document our ancestral roots from the Sangam era to the present. By recording family trees, migration history,
          and community contributions, we help future generations understand and preserve their heritage.
        </p>
      </>
    ),
  },
  {
    text: 'Provide a transparent referee-based verification process for new registrations.',
    details: (
      <>
        <p className="mt-2">
          Referees are appointed and managed by the Admin. During member registration, applicants select a referee from the
          approved list. The referee reviews the application and submits a recommendation before the Admin makes the final
          approval decision. This process ensures transparency, accountability, and trust within the Union.
        </p>
      </>
    ),
  },
  {
    text: 'Keep members informed through community events, notices, and announcements.',
    details: (
      <>
        <p className="mt-2">
          Serve as the official communication platform for the Sangam. From Annual General Meeting (AGM) notices and welfare
          updates to temple festivals and cultural programs, we ensure every member stays informed and connected.
        </p>
      </>
    ),
  },
  {
    text: 'Enable members to find and reconnect with verified relatives and community contacts.',
    details: (
      <>
        <p className="mt-2">
          Help families separated by migration and time reconnect while strengthening professional, social, and community
          support networks across Sri Lanka and around the world.
        </p>
      </>
    ),
  },
  {
    text: 'Support welfare, educational, and cultural initiatives within the community.',
    details: (
      <>
        <div className="mt-2">
          <h4 className="font-medium">Welfare</h4>
          <p className="mt-1">Emergency assistance, health support, and aid for underprivileged families.</p>

          <h4 className="mt-3 font-medium">Education</h4>
          <p className="mt-1">Scholarships, career guidance, and youth leadership development programs.</p>

          <h4 className="mt-3 font-medium">Culture</h4>
          <p className="mt-1">Preserving our traditions, promoting Silambam, supporting temple festivals, and protecting the Tamil language and cultural heritage.</p>
        </div>
      </>
    ),
  },
  {
    text: 'Protect member data with role-based access control and modern security practices.',
    details: (
      <>
        <p className="mt-2">
          Implement role-based access control, secure authentication, and modern security practices to protect personal and
          genealogical data. Only authorized roles (admins, referees) should access sensitive verification workflows and member records.
        </p>
      </>
    ),
  },
]

export default function Objectives() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div>
      <PageHero eyebrow="Our purpose" title="Objectives" description="What this platform is built to achieve for the community." />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ul className="space-y-3">
          {OBJECTIVES.map((o, i) => (
            <li key={o.text} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <CheckCircle2 className="mt-0.5 shrink-0 text-gold-700" size={20} />
              <div className="w-full">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-700">{o.text}</span>
                  {o.details && (
                    <button
                      type="button"
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      aria-expanded={openIndex === i}
                      className="shrink-0 text-sm font-medium text-gold-700 hover:underline"
                    >
                      {openIndex === i ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
                {openIndex === i && o.details && (
                  <div className="mt-1 text-sm leading-relaxed text-slate-600">{o.details}</div>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <h3 className="font-display text-2xl font-semibold text-navy-900">Our Vision</h3>
          <p className="mt-2 leading-relaxed text-slate-600">
            To build the Sri Lankan Mukkulathor community into a united, progressive, and respected community by
            promoting transparency, unity, education, economic empowerment, cultural heritage, and dedicated
            service to future generations.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 px-8 py-10 text-center">
          <h3 className="font-display text-2xl font-semibold text-gold-300">Our Core Mission</h3>
          <p className="mt-3 font-display text-2xl text-white">
            "Unity in Three Clans. Service to the Community. Pride in Our Heritage."
          </p>
        </div>
      </section>
    </div>
  )
}