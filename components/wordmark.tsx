import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('font-serif leading-none tracking-[0.18em] text-foreground', className)}
      aria-label="Atelier Noir home"
    >
      <span className="font-medium">ATELIER</span>{' '}
      <span className="italic text-gold-gradient tracking-normal">Noir</span>
    </Link>
  )
}
