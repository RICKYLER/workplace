'use client'

import Link from 'next/link'
import { useState } from 'react'
import { User as UserIcon, ShoppingBag, LogOut, LayoutDashboard, Menu, X, ShieldCheck } from 'lucide-react'
import { Wordmark } from '@/components/wordmark'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Grands', href: '/#collection' },
  { label: 'Uprights', href: '/#collection' },
  { label: 'Digital', href: '/#collection' },
  { label: 'Atelier', href: '/#atelier' },
  { label: 'Trade-In', href: '/trade-in' },
  { label: 'Customer Service', href: '/customer-service' },
  { label: 'Compare', href: '/compare' },
]

export function SiteHeader() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = user?.role === 'admin' || (user?.email && (user.email.includes('robert') || user.email.includes('ara')))

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Wordmark className="text-lg md:text-xl" />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          {/* Admin Workspace Direct Access Button */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded border border-gold/40 bg-gold/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold/20 md:flex"
            >
              <ShieldCheck className="size-3.5" />
              Admin OS
            </Link>
          )}

          {user ? (
            <div
              className="relative hidden md:block"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-foreground transition-colors hover:text-gold"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="grid size-8 place-items-center rounded-full border border-gold/50 text-gold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[7rem] truncate">{user.name.split(' ')[0]}</span>
              </button>
              {menuOpen && (
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
                      onClick={() => setMenuOpen(false)}
                    >
                      <ShieldCheck className="size-4 text-gold" /> Admin Workspace
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard className="size-4 text-gold" /> My Dashboard
                  </Link>
                  <button
                    role="menuitem"
                    onClick={() => {
                      signOut()
                      setMenuOpen(false)
                    }}
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

          <button
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden border-t border-border/60 bg-background lg:hidden transition-all',
          mobileOpen ? 'max-h-96' : 'max-h-0 border-t-0',
        )}
      >
        <nav className="flex flex-col px-5 py-4" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-3 border-t border-border/60 pt-4">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="text-xs uppercase tracking-[0.2em] text-gold font-semibold"
              >
                Admin OS Workspace →
              </Link>
            )}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs uppercase tracking-[0.2em] text-gold"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setMobileOpen(false)
                  }}
                  className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="text-xs uppercase tracking-[0.2em] text-gold"
              >
                Sign in / Register
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
