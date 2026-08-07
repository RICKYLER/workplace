'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { products, formatPrice, type Product } from '@/lib/products'
import { InquiryDialog } from '@/components/inquiry-dialog'
import { cn } from '@/lib/utils'

const FILTERS = ['All', 'Grand', 'Upright', 'Digital'] as const

export function Collection() {
  const [active, setActive] = useState<(typeof FILTERS)[number]>('All')
  const shown =
    active === 'All' ? products : products.filter((p) => p.category === active)

  return (
    <section id="collection" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-gold">The Collection</p>
          <h2 className="mt-4 max-w-xl font-serif text-4xl font-medium leading-tight text-balance md:text-5xl">
            Sixteen instruments. Not one of them ordinary.
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={cn(
                'border px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.2em] transition-colors',
                active === f
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [dialog, setDialog] = useState<'inquire' | 'order' | null>(null)

  return (
    <article className="group relative flex flex-col overflow-hidden border border-border bg-card transition-colors hover:border-gold/40">
      <div className="relative aspect-[4/3] overflow-hidden bg-background">
        <Image
          src={product.image || '/placeholder.svg'}
          alt={`${product.name}, a ${product.finish.toLowerCase()} ${product.category.toLowerCase()} piano`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 border border-gold/40 bg-background/70 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-gold backdrop-blur">
          {product.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Link href={`/piano/${product.id}`} className="font-serif text-2xl font-medium transition-colors hover:text-gold">{product.name}</Link>
        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          {product.finish}
        </p>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{product.blurb}</p>
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <span className="text-lg text-gold-gradient font-medium">
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setDialog('inquire')}
            className="border border-border px-4 py-2.5 text-[0.6rem] uppercase tracking-[0.2em] text-foreground transition-colors hover:border-gold/50 hover:text-gold"
          >
            Inquire
          </button>
          <button
            onClick={() => setDialog('order')}
            className="bg-gold-gradient px-4 py-2.5 text-[0.6rem] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Reserve
          </button>
        </div>
      </div>

      <InquiryDialog
        product={product}
        intent={dialog ?? 'inquire'}
        open={dialog !== null}
        onClose={() => setDialog(null)}
      />
    </article>
  )
}
