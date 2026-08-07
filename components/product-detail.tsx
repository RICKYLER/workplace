'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, GitCompareArrows, Heart, ShieldCheck, Truck, Wrench } from 'lucide-react'
import type { Product } from '@/lib/products'
import { formatPrice, products } from '@/lib/products'
import { InquiryDialog } from '@/components/inquiry-dialog'

export function ProductDetail({ product }: { product: Product }) {
  const [intent, setIntent] = useState<'inquire' | 'order' | null>(null)
  const [saved, setSaved] = useState(false)
  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 2)

  return (
    <main className="min-h-svh pt-20">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <Link href="/#collection" className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold">
          <ArrowLeft className="size-3.5" /> Back to collection
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden border border-border bg-card">
              <Image src={product.image} alt={product.name} fill priority className="object-cover" />
              <span className="absolute left-5 top-5 border border-gold/40 bg-background/75 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-gold backdrop-blur">{product.category}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[product.image, product.image, product.image].map((src, index) => (
                <div key={`${src}-${index}`} className={`relative aspect-[4/3] overflow-hidden border ${index === 0 ? 'border-gold/70' : 'border-border'}`}>
                  <Image src={src} alt={`${product.name} view ${index + 1}`} fill className="object-cover opacity-80" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.35em] text-gold">The instrument</p>
            <h1 className="mt-4 font-serif text-5xl font-medium leading-tight text-balance md:text-6xl">{product.name}</h1>
            <p className="mt-3 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">{product.finish}</p>
            <p className="mt-8 text-2xl text-gold-gradient">{formatPrice(product.price)}</p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">{product.blurb}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setIntent('inquire')} className="border border-border px-5 py-4 text-[0.65rem] uppercase tracking-[0.2em] transition-colors hover:border-gold/50 hover:text-gold">Inquire about this piano</button>
              <button type="button" onClick={() => setIntent('order')} className="bg-gold-gradient px-5 py-4 text-[0.65rem] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90">Reserve this instrument</button>
            </div>
            <div className="mt-3 flex gap-3">
              <button type="button" onClick={() => setSaved((value) => !value)} className="flex flex-1 items-center justify-center gap-2 border border-border px-5 py-3 text-[0.65rem] uppercase tracking-[0.2em] hover:border-gold/50 hover:text-gold"><Heart className={`size-4 ${saved ? 'fill-gold text-gold' : ''}`} /> {saved ? 'Saved' : 'Save instrument'}</button>
              <Link href={`/compare?add=${product.id}`} className="flex flex-1 items-center justify-center gap-2 border border-border px-5 py-3 text-[0.65rem] uppercase tracking-[0.2em] hover:border-gold/50 hover:text-gold"><GitCompareArrows className="size-4" /> Compare</Link>
            </div>

            <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: 'Atelier inspected', text: 'Final inspection before delivery.' },
                { icon: Truck, title: 'White-glove delivery', text: 'Climate-controlled transport.' },
                { icon: Wrench, title: 'First tuning included', text: 'A complimentary tuning after installation.' },
                { icon: ShieldCheck, title: 'Aftercare support', text: 'Our specialists remain available after delivery.' },
              ].map((item) => <div key={item.title} className="bg-card p-5"><item.icon className="size-5 text-gold" strokeWidth={1.4} /><p className="mt-4 text-sm">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.text}</p></div>)}
            </div>
          </div>
        </div>

        <section className="mt-24 grid gap-10 border-t border-border pt-12 md:grid-cols-2">
          <div><p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold">Specifications</p><h2 className="mt-3 font-serif text-3xl">Made for a particular room.</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[['Category', product.category], ['Finish', product.finish], ['Availability', 'By appointment'], ['Delivery', '7–14 days'], ['Warranty', '10 years'], ['Origin', 'Atelier selected']].map(([label, value]) => <div key={label} className="border-b border-border pb-3"><p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p><p className="mt-2 text-sm">{value}</p></div>)}
          </div>
        </section>

        {related.length > 0 && <section className="mt-24 border-t border-border pt-12"><p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold">You may also hear</p><div className="mt-6 grid gap-5 sm:grid-cols-2">{related.map((item) => <Link key={item.id} href={`/piano/${item.id}`} className="group flex items-center gap-5 border border-border bg-card p-4 hover:border-gold/50"><div className="relative size-24 overflow-hidden"><Image src={item.image} alt={item.name} fill className="object-cover transition-transform group-hover:scale-105" /></div><div><p className="font-serif text-xl">{item.name}</p><p className="mt-1 text-xs text-gold-gradient">{formatPrice(item.price)}</p></div></Link>)}</div></section>}
      </div>
      <InquiryDialog product={product} intent={intent ?? 'inquire'} open={intent !== null} onClose={() => setIntent(null)} />
    </main>
  )
}
