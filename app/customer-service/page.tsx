'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Clock3, Mail, MapPin, Phone, Send } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const faqs = [
  ['How long does delivery take?', 'Most Manila deliveries take 7–14 days after final inspection.'],
  ['Can I trade in my piano?', 'Yes. Submit your instrument details through our trade-in appraisal flow.'],
  ['Is tuning included?', 'Every piano includes a complimentary first tuning after installation.'],
  ['Can I speak with a specialist?', 'Absolutely. Send a message or call the concierge during service hours.'],
]

export default function CustomerServicePage() {
  const [sent, setSent] = useState(false)
  return (
    <>
      <SiteHeader />
      <main className="min-h-svh pt-20">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <div className="max-w-3xl">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold">Atelier concierge</p>
            <h1 className="mt-4 font-serif text-5xl font-medium leading-tight md:text-7xl">
              A quiet answer to every question.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              From a first note to a piano already installed in your home, our customer service team is here to make the next step feel considered.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <a href="mailto:concierge@ateliernoir.com" className="border border-border bg-card p-7 hover:border-gold/50">
              <Mail className="size-5 text-gold" />
              <p className="mt-5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Email</p>
              <p className="mt-2 text-sm">concierge@ateliernoir.com</p>
            </a>
            <a href="tel:+63288181974" className="border border-border bg-card p-7 hover:border-gold/50">
              <Phone className="size-5 text-gold" />
              <p className="mt-5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Phone</p>
              <p className="mt-2 text-sm">+63 2 8818 1974</p>
            </a>
            <div className="border border-border bg-card p-7">
              <Clock3 className="size-5 text-gold" />
              <p className="mt-5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Service hours</p>
              <p className="mt-2 text-sm">Monday–Saturday · 9 AM–6 PM</p>
            </div>
          </div>
          <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setSent(true)
              }}
              className="border border-border bg-card p-7 md:p-10"
            >
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-gold">Send a message</p>
              <h2 className="mt-3 font-serif text-3xl">Tell us what you need.</h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Full name</span>
                  <input required className="atelier-input mt-2" placeholder="Maria Reyes" />
                </label>
                <label>
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Email</span>
                  <input required type="email" className="atelier-input mt-2" placeholder="you@email.com" />
                </label>
                <label>
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Reference number</span>
                  <input className="atelier-input mt-2" placeholder="Order or trade-in ID" />
                </label>
                <label>
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Topic</span>
                  <select className="atelier-input mt-2">
                    <option>Order support</option>
                    <option>Trade-in</option>
                    <option>Delivery</option>
                    <option>Playing room</option>
                    <option>General question</option>
                  </select>
                </label>
                <label className="sm:col-span-2">
                  <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Message</span>
                  <textarea required className="atelier-input mt-2 min-h-36 resize-y" placeholder="How may we help?"></textarea>
                </label>
              </div>
              <button
                type="submit"
                className="mt-7 flex w-full items-center justify-center gap-2 bg-gold-gradient py-4 text-[0.65rem] uppercase tracking-[0.2em] text-primary-foreground"
              >
                <Send className="size-3.5" /> {sent ? 'Message received' : 'Send to concierge'}
              </button>
            </form>
            <div>
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-gold" />
                <h2 className="font-serif text-3xl">Common questions</h2>
              </div>
              <div className="mt-6 divide-y divide-border border-y border-border">
                {faqs.map(([question, answer]) => (
                  <details key={question} className="group py-5">
                    <summary className="cursor-pointer list-none text-sm group-open:text-gold">{question}</summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
                  </details>
                ))}
              </div>
              <div className="mt-8 border border-gold/25 bg-card p-6">
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold">Visit the atelier</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Legazpi Village, Makati City
                  <br />
                  Manila, Philippines
                </p>
                <Link href="/customer-service" className="mt-5 inline-block text-[0.65rem] uppercase tracking-[0.2em] text-gold">
                  Book a private session →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
