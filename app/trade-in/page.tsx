import Image from 'next/image'
import type { Metadata } from 'next'
import { ClipboardList, Search, HandCoins } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { TradeInForm } from '@/components/trade-in/trade-in-form'

export const metadata: Metadata = {
  title: 'Trade-In · Atelier Noir',
  description:
    'Trade your current piano toward a new instrument. Get an instant estimated trade-in credit and a firm offer from our specialists.',
}

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Submit your instrument',
    body: 'Tell us the make, model, age and condition. Get an indicative credit in seconds.',
  },
  {
    icon: Search,
    title: 'We appraise it',
    body: 'A specialist inspects the piano — action, soundboard, finish — and confirms a firm offer.',
  },
  {
    icon: HandCoins,
    title: 'Apply the credit',
    body: 'Accept the offer and your trade-in value comes straight off your next instrument.',
  },
]

export default function TradeInPage() {
  return (
    <main>
      <SiteHeader />

      {/* hero */}
      <section className="relative flex min-h-[70svh] items-end overflow-hidden pt-20">
        <Image
          src="/images/atelier.png"
          alt="A craftsman voicing the interior of a grand piano in the atelier"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 md:px-8 md:pb-24">
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-gold">Trade-In Programme</p>
          <h1 className="mt-5 max-w-3xl text-balance font-serif text-5xl font-medium leading-[0.95] md:text-7xl">
            Let your old piano <span className="text-gold-gradient">pay for the next.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Every instrument holds value. Trade your current piano toward any grand, upright or stage
            piano in the collection — appraised by hand, credited in full.
          </p>
        </div>
      </section>

      {/* how it works */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-px bg-border/60 px-5 py-0 md:grid-cols-3 md:px-8">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-background p-8 md:p-10">
              <div className="flex items-center gap-4">
                <span className="font-serif text-2xl text-gold-gradient">0{i + 1}</span>
                <s.icon className="size-5 text-gold" strokeWidth={1.4} />
              </div>
              <h3 className="mt-6 font-serif text-xl font-medium">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* form */}
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <div className="mb-10 text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-gold">Get your estimate</p>
          <h2 className="mt-4 text-balance font-serif text-4xl font-medium md:text-5xl">
            Value your instrument
          </h2>
        </div>
        <TradeInForm />
      </section>

      <SiteFooter />
    </main>
  )
}
