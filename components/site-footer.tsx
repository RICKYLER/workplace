import Link from 'next/link'
import { Wordmark } from '@/components/wordmark'

const COLUMNS = [
  {
    title: 'Instruments',
    links: [
      { name: 'Concert Grands', href: '/#collection' },
      { name: 'Baby Grands', href: '/#collection' },
      { name: 'Uprights', href: '/#collection' },
      { name: 'Digital & Stage', href: '/#collection' },
    ],
  },
  {
    title: 'The Atelier',
    links: [
      { name: 'Our Story', href: '/#atelier' },
      { name: 'Trade-In', href: '/trade-in' },
      { name: 'Compare', href: '/compare' },
      { name: 'Careers', href: '/customer-service' },
    ],
  },
  {
    title: 'Service',
    links: [
      { name: 'Tuning & Care', href: '/customer-service' },
      { name: 'White-Glove Delivery', href: '/customer-service' },
      { name: 'Aftercare & Warranty', href: '/customer-service' },
      { name: 'Customer Service', href: '/customer-service' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark className="text-xl" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A small, obsessive collection of grands, uprights and stage pianos — each one voiced
              by hand before it leaves the atelier.
            </p>
            <p className="mt-6 text-[0.65rem] uppercase tracking-[0.25em] text-gold">
              Est. 1974 · Manila &amp; Kyoto
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-gold"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Atelier Noir. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/customer-service" className="transition-colors hover:text-gold">
              Terms
            </Link>
            <Link href="/customer-service" className="transition-colors hover:text-gold">
              Privacy
            </Link>
            <Link href="/customer-service" className="transition-colors hover:text-gold">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
