export default function PageHero({ eyebrow, title, description }) {
  return (
    <section className="relative overflow-hidden border-b border-royal-gold/20 bg-royal-low">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {eyebrow && (
          <p className="inline-flex items-center gap-2 rounded-full bg-royal-highest px-4 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-royal-maroon">
            <span className="h-1.5 w-1.5 rounded-full bg-royal-gold" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 max-w-4xl font-headline text-[34px] font-bold leading-[1.2] tracking-tight text-royal-maroon-deep sm:text-5xl sm:leading-[1.17]">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-royal-ink-soft sm:text-lg">{description}</p>
        )}
      </div>
    </section>
  )
}
