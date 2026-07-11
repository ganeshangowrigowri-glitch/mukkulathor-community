export default function PageHero({ eyebrow, title, description }) {
  return (
    <section className="border-b border-slate-200 bg-navy-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {eyebrow && <p className="section-eyebrow text-gold-400">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-slate-300">{description}</p>}
      </div>
    </section>
  )
}
