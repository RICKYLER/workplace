import Link from 'next/link'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      <Image
        src="/images/hero-grand.png"
        alt="A glossy black concert grand piano lit by warm golden light in a dark room"
        fill
        priority
        className="object-cover object-right"
      />
      {/* left-to-right darkening so the copy stays legible */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pt-24 md:px-8">
        <p className="mb-6 text-[0.7rem] uppercase tracking-[0.4em] text-gold">
          Est. 1974 · Manila &amp; Kyoto
        </p>
        <h1 className="max-w-3xl font-serif text-5xl font-medium leading-[0.98] tracking-tight text-balance text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
          The instrument chooses the <span className="text-gold-gradient italic">room.</span>
        </h1>
        <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
          A small, obsessive collection of grands, uprights and stage pianos — each one voiced by
          hand before it leaves the atelier.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="#collection"
            className="inline-flex items-center justify-center bg-gold-gradient px-9 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            View the Collection
          </Link>
          <Link
            href="/trade-in"
            className="inline-flex items-center justify-center px-4 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-gold"
          >
            Trade in your piano →
          </Link>
        </div>
      </div>

      <div className="keybar absolute inset-x-0 bottom-0 h-2 opacity-70" aria-hidden="true" />
    </section>
  )
}
