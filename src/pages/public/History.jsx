import { useState } from 'react'
import PageHero from '../../components/layout/PageHero'

const TIMELINE = [
  {
    era: 'Ancient & Sangam period',
    text: 'Mukkulathor lineages are recorded in early Tamil literature, associated with martial leadership, land governance, and village stewardship across the southern plains.',
    details: (
      <>
        <p className="font-semibold">"Guardians of the Tamil Soil"</p>
        <p className="mt-2">
          The Mukkulathor community—"Those Belonging to the Three Clans"—is recorded in Sangam literature with roles in governance,
          martial defence, irrigation and temple stewardship.
        </p>
        <h4 className="mt-3 font-medium">Kallar</h4>
        <p className="mt-1">Chiefs and land governance; mentioned as forest chieftains and border protectors in Purananuru and Akananuru.</p>
        <h4 className="mt-3 font-medium">Maravar</h4>
        <p className="mt-1">Known for valor and martial leadership; "Maram" denotes courage and warrior traditions supported regional defences.</p>
        <h4 className="mt-3 font-medium">Agamudayar</h4>
        <p className="mt-1">Village stewardship and agriculture — managed irrigation, temples, and local administration.</p>
      </>
    ),
  },
  {
    era: 'Medieval period',
    text: 'Kallar, Maravar, and Agamudayar communities held key roles in regional administration, temple patronage, and defense of agrarian settlements.',
    details: (
      <>
        <p className="font-semibold">"Temple Builders & Kingdom Defenders"</p>
        <p className="mt-2">
          Under the Pandyas and early Cholas the clans served in administration and temple patronage, holding local titles and managing Nadu-level governance.
        </p>
        <h4 className="mt-3 font-medium">Administration</h4>
        <p className="mt-1">Held titles like Nattar, Kavalar and Ur-Arasu; responsible for local justice and land settlement.</p>
        <h4 className="mt-3 font-medium">Temple Patronage</h4>
        <p className="mt-1">Contributed to major and village temples (Meenakshi, Rameswaram, Ayyanar) via land grants and service.</p>
        <h4 className="mt-3 font-medium">Defense</h4>
        <p className="mt-1">Maravar regiments and Kallar chieftains acted as defenders of kingdoms and rural law-and-order.</p>
      </>
    ),
  },
  {
    era: 'Colonial period',
    text: 'Community identity consolidated under the broader Thevar designation, with documented social and political organization emerging in the 19th and early 20th centuries.',
    details: (
      <>
        <p className="font-semibold">"Resistance and Resilience"</p>
        <p className="mt-2">
          During Nayak, Maratha and British times many local chiefs resisted encroachments on land and self-governance.
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Poligar Wars and other uprisings saw Kallar and Maravar chieftains defend territory.</li>
          <li>Under colonial rule parts of the community were labeled by the Criminal Tribes Act; despite this they preserved martial arts (Silambam) and village institutions.</li>
          <li>Migration to Sri Lanka and Malaya established early Tamil Sangams abroad to preserve culture and mutual support.</li>
        </ul>
      </>
    ),
  },
  {
    era: 'Post-independence',
    text: 'Community associations, educational trusts, and welfare organizations were formed to support members across Tamil Nadu and beyond.',
    details: (
      <>
        <p className="font-semibold">"Unity, Education & Service"</p>
        <p className="mt-2">
          After 1947 emphasis shifted to education, political participation and social welfare. Associations and trusts were created to uplift members.
        </p>
        <h4 className="mt-3 font-medium">Community Organisations</h4>
        <p className="mt-1">Local and state-level associations supported schooling, scholarships, and temple maintenance.</p>
      </>
    ),
  },
  {
    era: 'Present day',
    text: 'A new generation works to digitize family records, document oral histories, and connect dispersed families through platforms like this registry.',
    details: (
      <>
        <p className="font-semibold">"Duty, Honor, and Service to Society"</p>
        <p className="mt-2">
          Today the community uses digital registries, documentation drives and diaspora organisations (e.g., Ilankai Mukkulathor Sangam) to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Preserve family records and oral histories</li>
          <li>Support education and temple traditions</li>
          <li>Provide transparent community governance and welfare programs</li>
        </ul>
      </>
    ),
  },
]

export default function History() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div>
      <PageHero eyebrow="Heritage" title="Community History" description="A continuing thread from the Sangam era to today's verified registry." />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ol className="relative space-y-10 border-l-2 border-slate-200 pl-8">
          {TIMELINE.map((t, i) => (
            <li key={t.era} className="relative">
              <span className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gold-500 bg-white" />
              <p className="font-mono text-xs uppercase tracking-wide text-gold-600">{t.era}</p>
              <p className="mt-1 text-slate-600">{t.text}</p>

              <div className="mt-3">
                {t.details && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      className="text-sm text-gold-600 hover:underline"
                    >
                      {openIndex === i ? 'Show less' : 'Read more'}
                    </button>
                    {openIndex === i && <div className="mt-3 text-sm text-slate-600">{t.details}</div>}
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-slate-400">
          This is a general overview. Communities are encouraged to contribute documented family histories and
          oral traditions through the Heritage Documentation Drive listed on the Events page.
        </p>
      </section>
    </div>
  )
}