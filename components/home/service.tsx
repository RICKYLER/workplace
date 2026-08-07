import Link from 'next/link'
import { Truck, Wrench, ShieldCheck } from 'lucide-react'

const SERVICES = [
  {
    icon: Wrench,
    title: 'Tuning & Voicing',
    body: 'Our technicians tune, regulate, and voice every instrument so it continues to sound exceptional at home.',
  },
  {
    icon: Truck,
    title: 'White-Glove Delivery',
    body: 'Climate-controlled transport and careful in-home installation across the Philippines and Japan.',
  },
  {
    icon: ShieldCheck,
    title: 'Aftercare & Warranty',
    body: 'From first tuning to long-term maintenance, our atelier stays with your piano for its whole life.',
  },
]

export function Service() {
  return (
    <section id="service" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-gold">Service &amp; Care</p>
        <h2 className="mt-4 font-serif text-4xl font-medium leading-tight text-balance md:text-5xl">
          We stay with the instrument for its whole life.
        </h2>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {SERVICES.map((s) => (
          <div key={s.title} className="border border-border bg-card p-8">
            <s.icon className="size-7 text-gold" strokeWidth={1.4} />
            <h3 className="mt-6 font-serif text-2xl font-medium">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 flex flex-col items-center gap-8 border border-gold/30 bg-gradient-to-b from-card to-background p-10 text-center md:p-16">
        <h3 className="max-w-2xl font-serif text-3xl font-medium leading-tight text-balance md:text-4xl">
          Choose an instrument with confidence, then let our atelier handle every detail.
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/#collection" className="inline-flex items-center justify-center bg-gold-gradient px-10 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90">Explore instruments</Link>
          <Link href="/customer-service" className="inline-flex items-center justify-center border border-border px-10 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-foreground transition-colors hover:border-gold/50 hover:text-gold">Talk to a specialist</Link>
        </div>
      </div>
    </section>
  )
}
