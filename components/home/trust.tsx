import { Award, Clock3, ShieldCheck, Sparkles } from 'lucide-react'

const TRUST = [
  { icon: ShieldCheck, title: '10-year atelier warranty', body: 'Every selected instrument leaves with considered protection and a team who stays involved.' },
  { icon: Clock3, title: 'White-glove delivery', body: 'Climate-controlled transport, in-home placement, and a first tuning in your room.' },
  { icon: Sparkles, title: 'Voiced by hand', body: 'Our technicians shape the touch and tone for the room, not just the showroom.' },
  { icon: Award, title: 'Flexible ways to own', body: 'Trade in an old instrument, reserve by deposit, or ask our concierge about financing.' },
]

export function Trust() {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-px bg-border md:grid-cols-4">
          {TRUST.map((item) => (
            <div key={item.title} className="bg-background p-7">
              <item.icon className="size-5 text-gold" strokeWidth={1.4} />
              <h3 className="mt-5 font-serif text-xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
