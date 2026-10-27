import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ArrowRight } from 'lucide-react'
import PageHero from '../../components/layout/PageHero'

// Short summaries of the three branches. The English text is taken from the
// "Ancient & Sangam period" details below. The Tamil names are the same ones used on
// the Home page - please verify the spellings.
const BRANCHES = [
  {
    name: 'Kallar',
    ta: 'கள்ளர்',
    desc: 'Chiefs and land governance; mentioned as forest chieftains and border protectors in Purananuru and Akananuru.',
  },
  {
    name: 'Maravar',
    ta: 'மறவர்',
    desc: 'Known for valor and martial leadership; "Maram" denotes courage and warrior traditions supported regional defences.',
  },
  {
    name: 'Agamudayar',
    ta: 'அகமுடையார்',
    desc: 'Village stewardship and agriculture — managed irrigation, temples, and local administration.',
  },
]

// `image` is optional. To add a picture to a stage, put a file in public/images/history/ and set
// e.g. image: '/images/history/sangam.jpg'. With `null` the stage shows no picture.
const TIMELINE = [
  {
    era: 'Ancient & Sangam period',
    image: '/images/history/sangam.jpg',
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
    image: '/images/history/medieval.jpg',
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
    image: '/images/history/colonial.jpg',
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
    image: '/images/history/post-independence.jpg',
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
   image: '/images/history/present.jpg',
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

      {/* The three branches */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <p className="section-eyebrow">The three branches</p>
        <h2 className="mt-2 font-headline text-3xl font-bold text-royal-maroon-deep sm:text-4xl">
          Kallar, Maravar and Agamudayar
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-royal-ink-soft">
          One community, three branches, each with its own part in the story below.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {BRANCHES.map((b, i) => (
            <article key={b.name} className="card overflow-hidden">
              <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 px-6 py-7">
                <p className="text-xs font-bold tracking-[0.12em] text-royal-gold-light">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-2 break-words font-headline text-3xl font-bold leading-tight text-royal-gold-light">{b.ta}</p>
              </div>
              <div className="p-6">
                <h3 className="font-headline text-xl font-bold text-royal-maroon-deep">{b.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-royal-ink-soft">{b.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="section-eyebrow">Through the centuries</p>
        <h2 className="mt-2 font-headline text-3xl font-bold text-royal-maroon-deep sm:text-4xl">A continuing thread</h2>

        <ol className="relative mt-10 space-y-8 border-l-2 border-royal-gold/40 pl-8 sm:pl-10">
          {TIMELINE.map((t, i) => {
            const isOpen = openIndex === i
            return (
              <li key={t.era} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[49px] top-5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-royal-gold bg-royal-maroon text-xs font-bold text-white sm:-left-[57px]"
                >
                  {i + 1}
                </span>
                <div className="card p-6">
                  {t.image && (
                    <img
                      src={t.image}
                      alt={t.era}
                      loading="lazy"
                      className="mb-5 aspect-[16/9] w-full rounded-lg object-cover"
                    />
                  )}
                  <h3 className="font-headline text-xl font-bold text-royal-maroon-deep sm:text-2xl">{t.era}</h3>
                  <p className="mt-2 leading-relaxed text-royal-ink-soft">{t.text}</p>

                  {t.details && (
                    <>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={`history-details-${i}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-royal-maroon hover:text-royal-maroon-deep"
                      >
                        {isOpen ? 'Show less' : 'Read more'}
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                      {isOpen && (
                        <div
                          id={`history-details-${i}`}
                          className="mt-4 rounded-lg border border-royal-gold/25 bg-royal-low p-5 text-sm leading-relaxed text-royal-ink-soft"
                        >
                          {t.details}
                        </div>
                      )}
                    </>
                  )}
                </div> 
              </li>
            )
          })}
        </ol>

        <p className="mt-10 text-sm text-royal-muted">
          This is a general overview. Communities are encouraged to contribute documented family histories and
          oral traditions through the Heritage Documentation Drive listed on the Events page.
        </p>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-royal-gold/30 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 px-6 py-12 text-linen-100 sm:px-12">
          <h2 className="max-w-2xl font-headline text-3xl font-bold text-white sm:text-4xl">
            Have family records or oral history to share?
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-linen-100/80">
            Help keep the community's story alive. See the Heritage Documentation Drive on the Events page,
            or get in touch to share what your family has preserved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/events" className="btn-gold">
              View Events
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/contact" className="btn-outline-light">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}