'use client'

import Link from 'next/link'
import { Headphones } from 'lucide-react'

export function FloatingHelp() {
  return (
    <Link
      href="/customer-service"
      className="fixed bottom-24 right-5 z-40 flex items-center gap-2 border border-gold/50 bg-card px-4 py-3 text-[0.6rem] uppercase tracking-[0.18em] text-gold shadow-2xl transition-colors hover:bg-gold/10 lg:bottom-5"
      aria-label="Open customer service"
    >
      <Headphones className="size-4" />
      <span className="hidden sm:inline">Need help?</span>
    </Link>
  )
}
