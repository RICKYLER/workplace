import Link from 'next/link'
import { ArrowUpRight, Quote } from 'lucide-react'

const voices = [
  ['“They listened to the room before they recommended the piano. That is rare.”', 'Elena Santos · Makati'],
  ['“The first tuning changed everything. It feels like the instrument has always belonged here.”', 'Marco Villanueva · Quezon City'],
]

export function Voices() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold">The Atelier Journal</p>
          <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight md:text-5xl">A piano is a relationship with a room.</h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">We believe the best instrument is not the loudest one in the showroom. It is the one that makes you want to play when nobody is listening.</p>
          <Link href="/customer-service" className="mt-8 inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-gold hover:opacity-80">Visit the atelier <ArrowUpRight className="size-3.5" /></Link>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2">
          {voices.map(([quote, author]) => (
            <div key={author} className="bg-card p-8">
              <Quote className="size-6 text-gold" strokeWidth={1.2} />
              <p className="mt-8 font-serif text-2xl leading-snug">{quote}</p>
              <p className="mt-8 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
