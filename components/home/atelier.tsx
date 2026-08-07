import Image from 'next/image'

const STATS = [
  { value: '260', label: 'Hours of voicing per grand' },
  { value: '1974', label: 'Founded in Manila' },
  { value: '9', label: 'Master craftspeople' },
]

export function Atelier() {
  return (
    <section id="atelier" className="scroll-mt-24 border-y border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-2">
        <div className="relative min-h-[420px] lg:min-h-[560px]">
          <Image
            src="/images/atelier.png"
            alt="A craftsperson voicing the hammers and strings inside a grand piano"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-5 py-16 md:px-14 md:py-24">
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-gold">Inside the Atelier</p>
          <h2 className="mt-4 font-serif text-4xl font-medium leading-tight text-balance md:text-5xl">
            Every note passes through a human hand.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            We build slowly and in small numbers. Between our workshops in Manila and Kyoto, each
            instrument is regulated, voiced and settled over months — never rushed to a showroom
            floor. When it finally leaves us, it is finished the way a concert artist would demand.
          </p>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="font-serif text-4xl text-gold-gradient">{s.value}</dt>
                <dd className="mt-2 text-xs leading-snug text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
