'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Check, GitCompareArrows, X } from 'lucide-react'
import { products, formatPrice } from '@/lib/products'

const specs = ['Category', 'Finish', 'Price', 'Availability', 'Delivery', 'Warranty']

export function CompareView({ initialId }: { initialId?: string }) {
  const [selected, setSelected] = useState(() => {
    const first = products.find((product) => product.id === initialId) ?? products[0]
    return [first.id, products.find((product) => product.id !== first.id)?.id ?? products[1].id]
  })
  const selectedProducts = selected
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean) as typeof products

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 3
        ? [...current, id]
        : current,
    )
  }

  return (
    <main className="min-h-svh pt-20">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <Link
          href="/#collection"
          className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="size-3.5" /> Collection
        </Link>
        <div className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold">
              Find your instrument
            </p>
            <h1 className="mt-3 font-serif text-5xl font-medium">Compare the collection.</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Choose up to three instruments and see how their voice, finish, and delivery details
              differ.
            </p>
          </div>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <GitCompareArrows className="size-4 text-gold" /> {selectedProducts.length} of 3 selected
          </span>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => toggle(product.id)}
              className={`border px-4 py-2.5 text-[0.6rem] uppercase tracking-[0.15em] transition-colors ${
                selected.includes(product.id)
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border text-muted-foreground hover:border-gold/50'
              }`}
            >
              {selected.includes(product.id) && <Check className="mr-2 inline size-3" />}
              {product.name}
            </button>
          ))}
        </div>

        <div className="mt-10 overflow-x-auto border border-border">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[150px_repeat(3,minmax(180px,1fr))] border-b border-border bg-card">
              <div className="p-5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                Instrument
              </div>
              {[0, 1, 2].map((index) => (
                <div key={index} className="border-l border-border p-4">
                  {selectedProducts[index] ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => toggle(selectedProducts[index].id)}
                        aria-label={`Remove ${selectedProducts[index].name}`}
                        className="absolute right-0 top-0 text-muted-foreground hover:text-gold"
                      >
                        <X className="size-3.5" />
                      </button>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={selectedProducts[index].image}
                          alt={selectedProducts[index].name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="mt-3 font-serif text-xl">{selectedProducts[index].name}</p>
                    </div>
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center border border-dashed border-border text-center text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
                      Select an instrument
                    </div>
                  )}
                </div>
              ))}
            </div>
            {specs.map((label) => (
              <div
                key={label}
                className="grid grid-cols-[150px_repeat(3,minmax(180px,1fr))] border-b border-border last:border-b-0"
              >
                <div className="bg-card p-5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </div>
                {[0, 1, 2].map((index) => {
                  const product = selectedProducts[index]
                  const value = product
                    ? ({
                        Category: product.category,
                        Finish: product.finish,
                        Price: formatPrice(product.price),
                        Availability: 'By appointment',
                        Delivery: '7–14 days',
                        Warranty: '10 years',
                      } as Record<string, string>)[label]
                    : '—'
                  return (
                    <div key={index} className="border-l border-border p-5 text-sm text-foreground">
                      {value}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
