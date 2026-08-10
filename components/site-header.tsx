'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  User as UserIcon,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Home,
  Building2,
  ArrowLeftRight,
  MoreHorizontal,
  ChevronUp,
  Headphones,
  GitCompare,
  Music,
  Piano,
} from 'lucide-react'
import { Wordmark } from '@/components/wordmark'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const DESKTOP_NAV = [
  { label: 'Grands', href: '/#collection' },
  { label: 'Uprights', href: '/#collection' },
  { label: 'Digital', href: '/#collection' },
  { label: 'Atelier', href: '/#atelier' },
  { label: 'Trade-In', href: '/trade-in' },
  { label: 'Customer Service', href: '/customer-service' },
  { label: 'Compare', href: '/compare' },
]

// Primary tabs in the bottom bar (mobile)
const BOTTOM_NAV = [
  { label: 'Home', href: '/', icon: Home, match: (p: string) => p === '/' },
  { label: 'Collection', href: '/#collection', icon: Piano, match: (_p: string) => false },
  { label: 'Atelier', href: '/#atelier', icon: Building2, match: (_p: string) => false },
  { label: 'Trade-In', href: '/trade-in', icon: ArrowLeftRight, match: (p: string) => p.startsWith('/trade-in') },
]

// "More" drawer additional items
const MORE_NAV = [
  { label: 'Grands', href: '/#collection', icon: Music },
  { label: 'Uprights', href: '/#collection', icon: Music },
  { label: 'Digital', href: '/#collection', icon: Music },
  { label: 'Customer Service', href: '/customer-service', icon: Headphones },
  { label: 'Compare', href: '/compare', icon: GitCompare },
]

export function SiteHeader() {
  const { user, signOut } = useAuth()
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const pathname = usePathname()

  const isAdmin =
    user?.role === 'admin' ||
    (user?.email && (user.email.includes('robert') || user.email.includes('ara')))

  return (
    <>
      {/* â”€â”€ Top header (desktop full / mobile wordmark + cart only) â”€â”€ */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-8">
          <Wordmark className="text-lg md:text-xl" />

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {DESKTOP_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Admin badge â€” desktop only */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden items-center gap-1.5 rounded border border-gold/40 bg-gold/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold/20 md:flex"
              >
                <ShieldCheck className="size-3.5" />
                Admin OS
              </Link>
            )}

            {/* User dropdown â€” desktop only */}
            {user ? (
              <div
                className="relative hidden md:block"
                onMouseLeave={() => setDesktopMenuOpen(false)}
              >
                <button
                  onClick={() => setDesktopMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-foreground transition-colors hover:text-gold"
                  aria-haspopup="menu"
                  aria-expanded={desktopMenuOpen}
                >
                  <span className="grid size-8 place-items-center rounded-full border border-gold/50 text-gold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[7rem] truncate">{user.name.split(' ')[0]}</span>
                </button>
                {desktopMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full w-56 overflow-hidden rounded-md border border-border bg-popover py-1 shadow-2xl"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold transition-colors hover:bg-accent"
                        onClick={() => setDesktopMenuOpen(false)}
                      >
                        <ShieldCheck className="size-4 text-gold" /> Admin Workspace
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                      onClick={() => setDesktopMenuOpen(false)}
                    >
                      <LayoutDashboard className="size-4 text-gold" /> My Dashboard
                    </Link>
                    <button
                      role="menuitem"
                      onClick={() => { signOut(); setDesktopMenuOpen(false) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <LogOut className="size-4 text-muted-foreground" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/account"
                className="hidden items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-foreground transition-colors hover:text-gold md:flex"
              >
                <UserIcon className="size-4" /> Sign in
              </Link>
            )}

            {/* Cart â€” always shown */}
            <Link
              href="/dashboard"
              className="relative flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-foreground transition-colors hover:text-gold"
              aria-label="Cart, 2 items"
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="grid size-4 place-items-center rounded-full bg-gold-gradient text-[0.6rem] font-semibold text-primary-foreground">
                2
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* â”€â”€ Mobile bottom navigation bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      >
        {/* More drawer */}
        {moreOpen && (
          <>
            {/* backdrop */}
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            />
            {/* sheet */}
            <div
              className="absolute bottom-[68px] left-0 right-0 z-50 mx-auto max-w-lg"
              style={{ animation: 'slideUpDrawer 0.25s cubic-bezier(0.32,0.72,0,1)' }}
            >
              <div className="mx-3 overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl">
                {/* drag handle */}
                <div className="flex justify-center pt-3">
                  <div className="h-1 w-10 rounded-full bg-border" />
                </div>

                <div className="p-2">
                  {/* extra nav links */}
                  {MORE_NAV.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-foreground/80 transition-colors hover:bg-accent"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-secondary">
                        <item.icon className="size-4" />
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  ))}

                  {/* divider */}
                  <div className="my-1 mx-4 h-px bg-border/60" />

                  {/* auth section */}
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-gold/40 bg-gold/10 font-serif text-base text-gold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMoreOpen(false)}
                          className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-gold transition-colors hover:bg-accent"
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-gold/40 bg-gold/10">
                            <ShieldCheck className="size-4 text-gold" />
                          </span>
                          <span className="text-sm font-medium">Admin Workspace</span>
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={() => setMoreOpen(false)}
                        className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-foreground/80 transition-colors hover:bg-accent"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-secondary">
                          <LayoutDashboard className="size-4" />
                        </span>
                        <span className="text-sm font-medium">My Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => { signOut(); setMoreOpen(false) }}
                        className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-foreground/70 transition-colors hover:bg-accent"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-secondary">
                          <LogOut className="size-4" />
                        </span>
                        <span className="text-sm font-medium">Sign out</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/account"
                      onClick={() => setMoreOpen(false)}
                      className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-gold transition-colors hover:bg-accent"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-gold/40 bg-gold/10">
                        <UserIcon className="size-4 text-gold" />
                      </span>
                      <span className="text-sm font-medium">Sign in / Register</span>
                    </Link>
                  )}
                </div>
                <div className="pb-3" />
              </div>
            </div>
          </>
        )}

        {/* the bar */}
        <div
          className="border-t border-border/50 bg-background/80 px-2 backdrop-blur-xl"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
        >
          <div className="mx-auto flex max-w-lg items-end justify-around pt-2">
            {BOTTOM_NAV.map((item) => {
              const active = item.match(pathname)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="group flex min-w-0 flex-1 flex-col items-center gap-1 pb-2 pt-1"
                >
                  <span
                    className={cn(
                      'relative flex h-9 w-14 items-center justify-center rounded-2xl transition-all duration-200',
                      active
                        ? 'bg-gold/15 shadow-[0_0_12px_rgba(180,140,60,0.25)]'
                        : 'group-hover:bg-accent',
                    )}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-2xl ring-1 ring-gold/30" aria-hidden />
                    )}
                    <item.icon
                      className={cn(
                        'size-5 transition-all duration-200',
                        active
                          ? 'scale-[1.12] text-gold drop-shadow-[0_0_6px_rgba(180,140,60,0.6)]'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      'text-[0.6rem] font-medium tracking-wide transition-colors duration-200',
                      active ? 'text-gold' : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}

            {/* More button */}
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className="group flex min-w-0 flex-1 flex-col items-center gap-1 pb-2 pt-1"
            >
              <span
                className={cn(
                  'relative flex h-9 w-14 items-center justify-center rounded-2xl transition-all duration-200',
                  moreOpen
                    ? 'bg-gold/15 shadow-[0_0_12px_rgba(180,140,60,0.25)]'
                    : 'group-hover:bg-accent',
                )}
              >
                {moreOpen && (
                  <span className="absolute inset-0 rounded-2xl ring-1 ring-gold/30" aria-hidden />
                )}
                {moreOpen ? (
                  <ChevronUp className="size-5 scale-[1.12] text-gold drop-shadow-[0_0_6px_rgba(180,140,60,0.6)] transition-all duration-200" />
                ) : (
                  <MoreHorizontal className="size-5 text-muted-foreground transition-all duration-200 group-hover:text-foreground" />
                )}
              </span>
              <span
                className={cn(
                  'text-[0.6rem] font-medium tracking-wide transition-colors duration-200',
                  moreOpen ? 'text-gold' : 'text-muted-foreground',
                )}
              >
                More
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
