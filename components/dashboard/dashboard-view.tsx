'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package,
  Heart,
  Settings,
  LogOut,
  MapPin,
  Music2,
  Repeat2,
  Plus,
  Bell,
  Save,
  Truck,
  CheckCircle2,
  CircleDot,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  ChevronRight,
  Headphones,
  Paperclip,
  Send,
  X,
  Clock3,
  Mail,
  Phone,
  HelpCircle,
  Wrench,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  ChevronUp,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Wordmark } from '@/components/wordmark'
import { products, formatPrice } from '@/lib/products'
import { TRADE_IN_STAGES, formatUSD, type TradeInStatus } from '@/lib/trade-in'

const ORDER_STAGES = [
  { key: 'confirmed', label: 'Order confirmed', short: 'Confirmed', description: 'Your reservation and payment have been confirmed by the Atelier team.', icon: CheckCircle2 },
  { key: 'preparation', label: 'Preparation', short: 'Preparation', description: 'The instrument is being prepared, regulated, and matched with your delivery requirements.', icon: Wrench },
  { key: 'voicing', label: 'Hand voicing', short: 'Voicing', description: 'Our piano technician is balancing the action and shaping the instrument’s voice for your room.', icon: Music2 },
  { key: 'inspection', label: 'Final inspection', short: 'Inspection', description: 'The instrument is being checked, photographed, and prepared for its journey.', icon: ShieldCheck },
  { key: 'delivery', label: 'In transit', short: 'Delivery', description: 'Your piano has left the Atelier and is on its way with our specialist delivery team.', icon: Truck },
  { key: 'installed', label: 'Installed', short: 'Installed', description: 'Your instrument has arrived, been placed, and is ready for its first tuning in your room.', icon: CheckCircle2 },
] as const

type OrderStageKey = (typeof ORDER_STAGES)[number]['key']

type Order = {
  id: string
  item: string
  status: string
  date: string
  progress: number
  currentStage: OrderStageKey
  ordered: string
  eta: string
  destination: string
  payment: string
  total: string
  deliveryNote: string
}

const ORDERS: Order[] = [
  {
    id: 'AN-2041',
    item: 'Noir Concert D',
    status: 'In voicing',
    date: 'Voiced by hand · ETA Sep',
    progress: 42,
    currentStage: 'voicing',
    ordered: '18 Aug 2026',
    eta: '12–18 Sep 2026',
    destination: 'Makati City, Metro Manila',
    payment: '50% deposit paid',
    total: '₱1,850,000',
    deliveryNote: 'White-glove delivery with first tuning included.',
  },
  {
    id: 'AN-1988',
    item: 'Kyoto Upright U3',
    date: 'Delivered 12 Mar 2026',
    progress: 100,
    currentStage: 'installed',
    status: 'Installed',
    ordered: '21 Feb 2026',
    eta: 'Delivered 12 Mar 2026',
    destination: 'Quezon City, Metro Manila',
    payment: 'Paid in full',
    total: '₱485,000',
    deliveryNote: 'First complimentary tuning completed 19 Mar 2026.',
  },
]

const SERVICE_REQUESTS = [
  { id: 'SR-2081', type: 'First tuning', item: 'Kyoto Upright U3', status: 'Scheduled', detail: 'Technician visit · 22 Aug 2026' },
  { id: 'SR-2087', type: 'Delivery coordination', item: 'Noir Concert D', status: 'In review', detail: 'White-glove delivery · Metro Manila' },
]

const NOTIFICATIONS = [
  { id: 'n1', kind: 'message', title: 'Admin replied to your trade-in', preview: 'Your Yamaha C3 offer is ready. We can discuss pickup and final terms.', time: '12 min ago', tab: 'trade-ins' as const, unread: true },
  { id: 'n2', kind: 'order', title: 'Order AN-2041 moved to hand voicing', preview: 'Your Noir Concert D is now being voiced by our technician.', time: 'Yesterday', tab: 'orders' as const, unread: true },
  { id: 'n3', kind: 'message', title: 'Customer service replied', preview: 'We have received your delivery question and will follow up shortly.', time: '2 days ago', tab: 'customer-service' as const, unread: false },
]

const TRADE_INS: {
  id: string
  instrument: string
  submitted: string
  status: TradeInStatus
  low: number
  high: number
  offer?: number
}[] = [
  {
    id: 'TI-3092',
    instrument: 'Yamaha C3 · 2008',
    submitted: 'Submitted 2 Aug 2026',
    status: 'offer',
    low: 12400,
    high: 15800,
    offer: 14200,
  },
  {
    id: 'TI-3110',
    instrument: 'Kawai K300 · 2015',
    submitted: 'Submitted 5 Aug 2026',
    status: 'appraised',
    low: 4200,
    high: 5400,
  },
]

const STATS = [
  { label: 'Active orders', value: '2', icon: Package },
  { label: 'Service requests', value: String(SERVICE_REQUESTS.length), icon: Wrench },
  { label: 'Trade-ins', value: String(TRADE_INS.length), icon: Repeat2 },
]

const NAV = [
  { key: 'overview', label: 'Overview', icon: Music2 },
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'services', label: 'Services', icon: Wrench },
  { key: 'trade-ins', label: 'Trade-ins', icon: Repeat2 },
  { key: 'saved', label: 'Saved', icon: Heart },
  { key: 'customer-service', label: 'Customer Service', icon: Headphones },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const

type TabKey = (typeof NAV)[number]['key']

// Bottom nav: primary tabs shown in the bar
const BOTTOM_NAV = [
  { key: 'overview' as TabKey, label: 'Overview', icon: Music2 },
  { key: 'orders' as TabKey, label: 'Orders', icon: Package },
  { key: 'services' as TabKey, label: 'Services', icon: Wrench },
  { key: 'trade-ins' as TabKey, label: 'Trade-ins', icon: Repeat2 },
]

// More drawer: remaining tabs
const MORE_NAV = [
  { key: 'saved' as TabKey, label: 'Saved', icon: Heart },
  { key: 'customer-service' as TabKey, label: 'Customer Service', icon: Headphones },
  { key: 'settings' as TabKey, label: 'Settings', icon: Settings },
]

export function DashboardView() {
  const router = useRouter()
  const { user, ready, signOut } = useAuth()
  const [tab, setTab] = useState<TabKey>('overview')
  const [selectedOrderId, setSelectedOrderId] = useState(ORDERS[0].id)
  const [discussionTradeInId, setDiscussionTradeInId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const unreadCount = notifications.filter((notification) => notification.unread).length
  const selectedOrder = ORDERS.find((order) => order.id === selectedOrderId) ?? ORDERS[0]
  const discussionTradeIn = TRADE_INS.find((tradeIn) => tradeIn.id === discussionTradeInId) ?? null

  useEffect(() => {
    if (ready && !user) router.replace('/account')
  }, [ready, user, router])

  if (!ready || !user) {
    return (
      <div className="grid min-h-svh place-items-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Loading…</p>
      </div>
    )
  }

  const saved = products.slice(0, 4)

  // Whether the active tab is in the "More" group
  const isMoreTab = MORE_NAV.some((n) => n.key === tab)

  return (
    <div className="min-h-svh pb-24 lg:pb-0">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-8">
          <Wordmark className="text-lg" />
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative text-muted-foreground transition-colors hover:text-gold"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={notificationsOpen}
              >
                <Bell className="size-5" />
                {unreadCount > 0 && <span className="absolute -right-2 -top-2 grid size-3.5 place-items-center rounded-full bg-gold text-[0.5rem] text-primary-foreground">{unreadCount}</span>}
              </button>
              {notificationsOpen && (
                <NotificationCenter
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onNavigate={(nextTab) => {
                    setTab(nextTab)
                    setNotificationsOpen(false)
                  }}
                  onMarkRead={(id) => setNotifications((items) => items.map((item) => item.id === id ? { ...item, unread: false } : item))}
                  onMarkAllRead={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))}
                  onClear={() => setNotifications([])}
                />
              )}
            </div>
            <Link
              href="/"
              className="hidden text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold sm:block"
            >
              Store
            </Link>
            <button
              onClick={() => {
                signOut()
                router.push('/')
              }}
              className="hidden items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-foreground hover:text-gold sm:flex"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-6 md:px-8 md:py-10 lg:grid-cols-[280px_1fr] lg:py-12">
        {/* profile sidebar — desktop only */}
        <aside className="hidden space-y-8 lg:block">
          <div className="border border-border bg-card p-8 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full border border-gold/50 font-serif text-3xl text-gold-gradient">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-5 font-serif text-2xl font-medium">{user.name}</h2>
            <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-4 inline-block border border-gold/40 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-gold">
              Atelier Member
            </p>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" /> Manila, Philippines
            </p>
          </div>

          <nav className="border border-border bg-card">
            {NAV.map((item) => {
              const active = tab === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex w-full items-center gap-3 border-b border-border px-6 py-4 text-left text-sm transition-colors last:border-b-0 hover:bg-accent ${
                    active ? 'bg-accent/60 text-gold' : 'text-foreground/80'
                  }`}
                >
                  {active && <span className="absolute left-0 top-0 h-full w-0.5 bg-gold-gradient" />}
                  <item.icon className="size-4" /> {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* main */}
        <div className="space-y-12">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.35em] text-gold">
              {NAV.find((n) => n.key === tab)?.label}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-medium leading-tight md:text-5xl">
              {tab === 'overview'
                ? `Good to see you, ${user.name.split(' ')[0]}.`
                : tab === 'orders'
                  ? 'Your instruments'
                  : tab === 'services'
                    ? 'Piano care services'
                    : tab === 'trade-ins'
                      ? 'Your trade-ins'
                      : tab === 'saved'
                        ? 'Saved instruments'
                        : tab === 'customer-service'
                          ? 'How can we help?'
                          : 'Account settings'}
            </h1>
          </div>

          {/* stat cards */}
          {tab === 'overview' && (
            <div className="grid gap-5 sm:grid-cols-3">
              {STATS.map((s) => (
                <button
                  key={s.label}
                  onClick={() =>
                    setTab(
                        s.label === 'Active orders'
                        ? 'orders'
                        : s.label === 'Service requests'
                          ? 'services'
                          : 'trade-ins',
                    )
                  }
                  className="border border-border bg-card p-6 text-left transition-colors hover:border-gold/40"
                >
                  <s.icon className="size-6 text-gold" strokeWidth={1.4} />
                  <p className="mt-5 font-serif text-4xl text-gold-gradient">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    {s.label}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* orders */}
          {(tab === 'overview' || tab === 'orders') && (
            <section>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-medium">Your instruments</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Follow every hand-finished stage from our atelier to your room.
                  </p>
                </div>
                <span className="text-[0.6rem] uppercase tracking-[0.18em] text-gold">
                  {ORDERS.length} orders
                </span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {ORDERS.map((o) => {
                  const active = o.id === selectedOrder.id
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSelectedOrderId(o.id)}
                      aria-pressed={active}
                      className={`border bg-card p-6 text-left transition-colors ${
                        active ? 'border-gold/60' : 'border-border hover:border-gold/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-serif text-xl">{o.item}</span>
                            <span className="text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
                              #{o.id}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{o.date}</p>
                        </div>
                        <ChevronRight className={`size-4 shrink-0 ${active ? 'text-gold' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="mt-5 flex items-center justify-between text-[0.6rem] uppercase tracking-[0.15em]">
                        <span className={active ? 'text-gold' : 'text-muted-foreground'}>{o.status}</span>
                        <span className="text-muted-foreground">{o.progress}% complete</span>
                      </div>
                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-gold-gradient" style={{ width: `${o.progress}%` }} />
                      </div>
                    </button>
                  )
                })}
              </div>
              <OrderTracker order={selectedOrder} />
            </section>
          )}

          {/* services */}
          {(tab === 'overview' || tab === 'services') && (
            <section>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-medium">Piano care services</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Track delivery, tuning, voicing, and appraisal requests.</p>
                </div>
                <Link href="/customer-service" className="text-[0.65rem] uppercase tracking-[0.2em] text-gold hover:opacity-80">Request support →</Link>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {SERVICE_REQUESTS.map((service) => (
                  <div key={service.id} className="border border-border bg-card p-6">
                    <Wrench className="size-5 text-gold" strokeWidth={1.4} />
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-serif text-lg">{service.type}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{service.item}</p>
                      </div>
                      <span className="border border-gold/30 px-2 py-1 text-[0.55rem] uppercase tracking-[0.12em] text-gold">{service.status}</span>
                    </div>
                    <p className="mt-4 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{service.detail} · #{service.id}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* trade-ins */}
          {(tab === 'overview' || tab === 'trade-ins') && (
          <section>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-medium">Your trade-ins</h3>
              <Link
                href="/trade-in"
                className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.2em] text-gold hover:opacity-80"
              >
                <Plus className="size-3.5" /> New trade-in
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {TRADE_INS.map((t) => {
                const stageIndex = TRADE_IN_STAGES.findIndex((s) => s.key === t.status)
                return (
                  <div key={t.id} className="border border-border bg-card p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-xl">{t.instrument}</span>
                        <span className="text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
                          #{t.id}
                        </span>
                      </div>
                      <span className="text-right font-serif text-lg text-gold-gradient">
                        {t.offer
                          ? formatUSD(t.offer)
                          : `${formatUSD(t.low)} – ${formatUSD(t.high)}`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.submitted}
                      {t.offer ? ' · Firm offer ready to accept' : ' · Estimated range'}
                    </p>

                    {/* stage tracker */}
                    <div className="mt-6 flex items-center">
                      {TRADE_IN_STAGES.map((stage, i) => {
                        const done = i <= stageIndex
                        return (
                          <div key={stage.key} className="flex flex-1 items-center last:flex-none">
                            <div className="flex flex-col items-center gap-2">
                              <span
                                className={`grid size-6 place-items-center rounded-full border text-[0.55rem] ${
                                  done ? 'border-gold/60 bg-gold/10 text-gold' : 'border-border text-muted-foreground'
                                }`}
                              >
                                {i + 1}
                              </span>
                              <span
                                className={`whitespace-nowrap text-[0.55rem] uppercase tracking-[0.12em] ${
                                  done ? 'text-gold' : 'text-muted-foreground'
                                }`}
                              >
                                {stage.label}
                              </span>
                            </div>
                            {i < TRADE_IN_STAGES.length - 1 && (
                              <span
                                className={`mx-2 mb-5 h-px flex-1 ${
                                  i < stageIndex ? 'bg-gold/50' : 'bg-border'
                                }`}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {t.status === 'offer' && (
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button className="bg-gold-gradient px-6 py-2.5 text-[0.6rem] uppercase tracking-[0.2em] text-primary-foreground">
                          Accept offer
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscussionTradeInId(t.id)}
                          className="border border-border px-6 py-2.5 text-[0.6rem] uppercase tracking-[0.2em] text-foreground transition-colors hover:border-gold/50 hover:text-gold"
                        >
                          Discuss with admin
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
          )}

          {/* saved */}
          {(tab === 'overview' || tab === 'saved') && (
          <section>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-medium">Saved instruments</h3>
              <Link
                href="/#collection"
                className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold"
              >
                Browse all
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {saved.map((p) => (
                <Link key={p.id} href={`/piano/${p.id}`} className="group block border border-border bg-card">
                  <div className="relative aspect-square overflow-hidden bg-background">
                    <Image
                      src={p.image || '/placeholder.svg'}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-serif text-base">{p.name}</p>
                    <p className="mt-1 text-xs text-gold-gradient">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          )}

          {/* customer service */}
          {tab === 'customer-service' && <CustomerServicePanel user={user} />}

          {/* settings */}
          {tab === 'settings' && <SettingsPanel user={user} />}
        </div>
      </div>

      {/* ── Mobile bottom navigation bar ─────────────────────────────────── */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      >
        {/* More drawer — slides up from behind the bar */}
        {moreOpen && (
          <>
            {/* backdrop */}
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            />
            {/* drawer sheet */}
            <div
              className="absolute bottom-[72px] left-0 right-0 z-50 mx-auto max-w-lg"
              style={{ animation: 'slideUpDrawer 0.25s cubic-bezier(0.32,0.72,0,1)' }}
            >
              <div className="mx-3 overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl">
                {/* handle */}
                <div className="flex justify-center pt-3">
                  <div className="h-1 w-10 rounded-full bg-border" />
                </div>
                <div className="p-2">
                  {MORE_NAV.map((item) => {
                    const active = tab === item.key
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => { setTab(item.key); setMoreOpen(false) }}
                        className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-colors ${
                          active
                            ? 'bg-gold/10 text-gold'
                            : 'text-foreground/80 hover:bg-accent'
                        }`}
                      >
                        <span className={`grid size-9 shrink-0 place-items-center rounded-xl border ${
                          active ? 'border-gold/40 bg-gold/10' : 'border-border bg-secondary'
                        }`}>
                          <item.icon className="size-4" />
                        </span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {active && <span className="ml-auto h-2 w-2 rounded-full bg-gold" />}
                      </button>
                    )
                  })}
                  {/* sign out row */}
                  <button
                    type="button"
                    onClick={() => { signOut(); router.push('/') }}
                    className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-foreground/70 transition-colors hover:bg-accent"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-secondary">
                      <LogOut className="size-4" />
                    </span>
                    <span className="text-sm font-medium">Sign out</span>
                  </button>
                </div>
                <div className="pb-3" />
              </div>
            </div>
          </>
        )}

        {/* the bar itself */}
        <div className="border-t border-border/50 bg-background/80 px-2 pb-safe backdrop-blur-xl" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
          <div className="mx-auto flex max-w-lg items-end justify-around pt-2">
            {BOTTOM_NAV.map((item) => {
              const active = tab === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => { setTab(item.key); setMoreOpen(false) }}
                  aria-current={active ? 'page' : undefined}
                  className="group flex min-w-0 flex-1 flex-col items-center gap-1 pb-2 pt-1"
                >
                  <span
                    className={`relative flex h-9 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
                      active
                        ? 'bg-gold/15 shadow-[0_0_12px_rgba(var(--gold-rgb,180,140,60),0.25)]'
                        : 'group-hover:bg-accent'
                    }`}
                  >
                    {active && (
                      <span
                        className="absolute inset-0 rounded-2xl ring-1 ring-gold/30"
                        aria-hidden
                      />
                    )}
                    <item.icon
                      className={`size-5 transition-all duration-200 ${
                        active
                          ? 'scale-[1.12] text-gold drop-shadow-[0_0_6px_rgba(180,140,60,0.6)]'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />
                  </span>
                  <span
                    className={`text-[0.6rem] font-medium tracking-wide transition-colors duration-200 ${
                      active ? 'text-gold' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}

            {/* More button */}
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className="group flex min-w-0 flex-1 flex-col items-center gap-1 pb-2 pt-1"
            >
              <span
                className={`relative flex h-9 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
                  isMoreTab || moreOpen
                    ? 'bg-gold/15 shadow-[0_0_12px_rgba(var(--gold-rgb,180,140,60),0.25)]'
                    : 'group-hover:bg-accent'
                }`}
              >
                {(isMoreTab || moreOpen) && (
                  <span className="absolute inset-0 rounded-2xl ring-1 ring-gold/30" aria-hidden />
                )}
                {moreOpen ? (
                  <ChevronUp
                    className={`size-5 transition-all duration-200 ${
                      isMoreTab || moreOpen
                        ? 'scale-[1.12] text-gold drop-shadow-[0_0_6px_rgba(180,140,60,0.6)]'
                        : 'text-muted-foreground'
                    }`}
                  />
                ) : (
                  <MoreHorizontal
                    className={`size-5 transition-all duration-200 ${
                      isMoreTab
                        ? 'scale-[1.12] text-gold drop-shadow-[0_0_6px_rgba(180,140,60,0.6)]'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                )}
              </span>
              <span
                className={`text-[0.6rem] font-medium tracking-wide transition-colors duration-200 ${
                  isMoreTab || moreOpen ? 'text-gold' : 'text-muted-foreground'
                }`}
              >
                More
              </span>
            </button>
          </div>
        </div>
      </nav>

      {discussionTradeIn && (
        <TradeInConversation
          tradeIn={discussionTradeIn}
          onClose={() => setDiscussionTradeInId(null)}
        />
      )}
    </div>
  )
}

function NotificationCenter({
  notifications,
  unreadCount,
  onNavigate,
  onMarkRead,
  onMarkAllRead,
  onClear,
}: {
  notifications: typeof NOTIFICATIONS
  unreadCount: number
  onNavigate: (tab: TabKey) => void
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onClear: () => void
}) {
  return (
    <div className="absolute right-0 top-8 z-50 w-[min(23rem,calc(100vw-2.5rem))] border border-border bg-popover shadow-2xl">
      <div className="flex items-start justify-between border-b border-border p-5">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-gold">Activity center</p>
          <h2 className="mt-1 font-serif text-xl">Notifications</h2>
          <p className="mt-1 text-xs text-muted-foreground">{unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You are all caught up.'}</p>
        </div>
        <button type="button" onClick={onMarkAllRead} disabled={!unreadCount} className="text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-gold disabled:opacity-40">Mark all read</button>
      </div>
      <div className="max-h-[22rem] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center"><Bell className="mx-auto size-5 text-gold" /><p className="mt-3 text-sm text-muted-foreground">No notifications yet.</p></div>
        ) : notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => { onMarkRead(notification.id); onNavigate(notification.tab) }}
            className={`flex w-full gap-3 border-b border-border p-4 text-left transition-colors hover:bg-accent ${notification.unread ? 'bg-gold/5' : ''}`}
          >
            <span className={`mt-1 grid size-7 shrink-0 place-items-center border ${notification.unread ? 'border-gold/50 text-gold' : 'border-border text-muted-foreground'}`}>
              {notification.kind === 'order' ? <Package className="size-3.5" /> : <MessageSquare className="size-3.5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-3"><span className="text-sm text-foreground">{notification.title}</span>{notification.unread && <span className="mt-1 size-1.5 shrink-0 rounded-full bg-gold" aria-label="Unread" />}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{notification.preview}</span>
              <span className="mt-2 block text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">{notification.time}</span>
            </span>
          </button>
        ))}
      </div>
      {notifications.length > 0 && <div className="flex justify-end border-t border-border p-3"><button type="button" onClick={onClear} className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-destructive"><Trash2 className="size-3" /> Clear notifications</button></div>}
    </div>
  )
}

function TradeInConversation({
  tradeIn,
  onClose,
}: {
  tradeIn: (typeof TRADE_INS)[number]
  onClose: () => void
}) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      from: 'admin',
      text: `Hello, we have reviewed your ${tradeIn.instrument} and prepared an offer of ${tradeIn.offer ? formatUSD(tradeIn.offer) : formatUSD(tradeIn.high)}. Would you like to discuss the details?`,
      time: 'Today · 10:42 AM',
    },
    {
      from: 'customer',
      text: 'Thank you. I would like to understand the pickup process and whether the offer is negotiable.',
      time: 'Today · 11:08 AM',
    },
  ])
  const [sent, setSent] = useState(false)

  function sendMessage() {
    const trimmed = message.trim()
    if (!trimmed) return
    setMessages((current) => [...current, { from: 'customer', text: trimmed, time: 'Just now' }])
    setMessage('')
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col border border-gold/30 bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border p-6 md:p-8">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-gold">Trade-in conversation</p>
            <h2 className="mt-2 font-serif text-3xl font-medium">Discuss with the Atelier</h2>
            <p className="mt-2 text-sm text-muted-foreground">{tradeIn.instrument} · #{tradeIn.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close conversation" className="text-muted-foreground transition-colors hover:text-gold">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-border px-6 py-4 text-xs md:px-8">
          <div>
            <p className="text-muted-foreground">Current offer</p>
            <p className="mt-1 font-serif text-xl text-gold-gradient">{tradeIn.offer ? formatUSD(tradeIn.offer) : formatUSD(tradeIn.high)}</p>
          </div>
          <span className="flex items-center gap-2 text-muted-foreground"><Clock3 className="size-3.5 text-gold" /> Replies within one business day</span>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6 md:p-8">
          {messages.map((item, index) => (
            <div key={`${item.time}-${index}`} className={`flex ${item.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] ${item.from === 'customer' ? 'bg-gold/10' : 'bg-background'} border border-border p-4`}>
                <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
                <p className="mt-3 text-[0.55rem] uppercase tracking-[0.15em] text-muted-foreground">
                  {item.from === 'customer' ? 'You' : 'Atelier Concierge'} · {item.time}
                </p>
              </div>
            </div>
          ))}
          {sent && <p className="text-center text-[0.6rem] uppercase tracking-[0.18em] text-gold">Message sent to the admin team</p>}
        </div>

        <div className="border-t border-border p-6 md:p-8">
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              rows={3}
              placeholder="Write a message to the admin team..."
              className="atelier-input min-h-20 resize-none"
              aria-label="Trade-in message"
            />
            <button type="button" onClick={sendMessage} aria-label="Send message" className="self-end bg-gold-gradient p-3 text-primary-foreground transition-opacity hover:opacity-90">
              <Send className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
            <span className="flex items-center gap-2"><Paperclip className="size-3.5" /> Attach appraisal photos</span>
            <span>Shift + Enter for a new line</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomerServicePanel({ user }: { user: { name: string; email: string } }) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Mail, label: 'Email us', value: 'concierge@ateliernoir.com', href: 'mailto:concierge@ateliernoir.com' },
          { icon: Phone, label: 'Call the atelier', value: '+63 2 8818 1974', href: 'tel:+63288181974' },
          { icon: Clock3, label: 'Service hours', value: 'Mon–Sat · 9 AM–6 PM', href: '#message-support' },
        ].map((item) => (
          <a key={item.label} href={item.href} className="border border-border bg-card p-6 transition-colors hover:border-gold/50">
            <item.icon className="size-5 text-gold" strokeWidth={1.4} />
            <p className="mt-5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{item.value}</p>
          </a>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <form id="message-support" onSubmit={(event) => { event.preventDefault(); setSent(true); setMessage('') }} className="border border-border bg-card p-6 md:p-8">
          <div className="flex items-center gap-3"><Headphones className="size-5 text-gold" strokeWidth={1.4} /><h3 className="font-serif text-2xl font-medium">Message customer service</h3></div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Ask about an order, delivery, trade-in, tuning, or anything else.</p>
          <label className="mt-7 block"><span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Subject</span><input className="atelier-input mt-2" placeholder="How can we help?" required /></label>
          <label className="mt-5 block"><span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Message</span><textarea className="atelier-input mt-2 min-h-32 resize-y" value={message} onChange={(event) => setMessage(event.target.value)} placeholder={`Hi Atelier team, this is ${user.name}...`} required /></label>
          <div className="mt-6 flex items-center gap-4"><button type="submit" className="flex items-center gap-2 bg-gold-gradient px-6 py-3 text-[0.6rem] uppercase tracking-[0.18em] text-primary-foreground"><Send className="size-3.5" /> Send message</button>{sent && <span className="text-[0.6rem] uppercase tracking-[0.15em] text-gold">Sent to concierge</span>}</div>
        </form>

        <div className="border border-border bg-card p-6 md:p-8">
          <div className="flex items-center gap-3"><HelpCircle className="size-5 text-gold" strokeWidth={1.4} /><h3 className="font-serif text-2xl font-medium">Common questions</h3></div>
          <div className="mt-6 divide-y divide-border">
            {[
              ['How long does piano delivery take?', 'Most Manila deliveries take 7–14 days after final inspection.'],
              ['Can I change my trade-in offer?', 'Message the admin team and we can review the offer together.'],
              ['Do you include tuning after delivery?', 'Yes. Every piano includes a complimentary first tuning.'],
            ].map(([question, answer]) => <details key={question} className="group py-4"><summary className="cursor-pointer list-none text-sm text-foreground group-open:text-gold">{question}</summary><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{answer}</p></details>)}
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderTracker({ order }: { order: Order }) {
  const currentIndex = ORDER_STAGES.findIndex((stage) => stage.key === order.currentStage)
  const delivered = order.currentStage === 'installed'

  return (
    <div className="mt-6 border border-gold/25 bg-card p-6 md:p-8">
      <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.25em] text-gold">Order {order.id}</p>
          <h4 className="mt-2 font-serif text-3xl font-medium">{order.item}</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            {delivered ? 'Your piano has arrived safely.' : `Estimated arrival · ${order.eta}`}
          </p>
        </div>
        <span className="flex items-center gap-2 border border-gold/40 px-4 py-2 text-[0.6rem] uppercase tracking-[0.18em] text-gold">
          <CircleDot className="size-3.5" /> {order.status}
        </span>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Process timeline</p>
          <span className="font-serif text-xl text-gold-gradient">{order.progress}%</span>
        </div>
        <div className="relative space-y-0">
          <div className="absolute bottom-6 left-3.5 top-6 w-px bg-border" />
          {ORDER_STAGES.map((stage, index) => {
            const complete = index <= currentIndex
            const active = index === currentIndex
            const StageIcon = stage.icon
            return (
              <div key={stage.key} className="relative flex gap-5 pb-7 last:pb-0">
                <div
                  className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full border ${
                    complete ? 'border-gold/70 bg-gold/10 text-gold' : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  <StageIcon className="size-3.5" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className={`text-sm ${complete ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {stage.label}
                    </p>
                    {active && (
                      <span className="border border-gold/40 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.15em] text-gold">
                        Current stage
                      </span>
                    )}
                  </div>
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                    {stage.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Ordered', value: order.ordered, icon: Package },
          { label: 'Destination', value: order.destination, icon: MapPin },
          { label: 'Payment', value: order.payment, icon: CreditCard },
          { label: 'Total', value: order.total, icon: ShieldCheck },
        ].map((detail) => (
          <div key={detail.label} className="bg-background p-4">
            <detail.icon className="size-4 text-gold" strokeWidth={1.4} />
            <p className="mt-3 text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">{detail.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{detail.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 size-4 shrink-0 text-gold" />
          <p className="text-xs leading-relaxed text-muted-foreground">{order.deliveryNote}</p>
        </div>
        <a
          href={`mailto:concierge@ateliernoir.com?subject=Order%20${encodeURIComponent(order.id)}%20support`}
          className="flex shrink-0 items-center justify-center gap-2 border border-border px-5 py-2.5 text-[0.6rem] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-gold/50 hover:text-gold"
        >
          <MessageCircle className="size-3.5" /> Contact Atelier
        </a>
      </div>
    </div>
  )
}

function SettingsPanel({ user }: { user: { name: string; email: string } }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: '',
    city: 'Manila, Philippines',
  })
  const [prefs, setPrefs] = useState({ arrivals: true, events: true, offers: false })
  const [saved, setSaved] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSaved(true)
        }}
        className="border border-border bg-card p-8"
      >
        <h3 className="font-serif text-2xl font-medium">Profile details</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the contact details we use for orders and service requests.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              Full name
            </span>
            <input
              className="atelier-input mt-2"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              className="atelier-input mt-2"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              Phone
            </span>
            <input
              className="atelier-input mt-2"
              placeholder="+63 900 000 0000"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              City
            </span>
            <input
              className="atelier-input mt-2"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
            />
          </label>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-gold-gradient px-7 py-3 text-[0.65rem] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Save className="size-4" /> Save changes
          </button>
          {saved && (
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-gold">
              Changes saved
            </span>
          )}
        </div>
      </form>

      <div className="border border-border bg-card p-8">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-gold" strokeWidth={1.4} />
          <h3 className="font-serif text-2xl font-medium">Notifications</h3>
        </div>
        <div className="mt-6 divide-y divide-border">
          {(
            [
              { key: 'arrivals', label: 'New arrivals', desc: 'Alert me when a new instrument joins the collection.' },
              { key: 'events', label: 'Salon events', desc: 'Invitations to recitals and private playing sessions.' },
              { key: 'offers', label: 'Trade-in offers', desc: 'Notify me when an appraisal or offer is ready.' },
            ] as const
          ).map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-6 py-4">
              <div>
                <p className="text-sm text-foreground">{row.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{row.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[row.key]}
                onClick={() => setPrefs((p) => ({ ...p, [row.key]: !p[row.key] }))}
                className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                  prefs[row.key] ? 'border-gold/60 bg-gold/30' : 'border-border bg-secondary'
                }`}
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full transition-all ${
                    prefs[row.key] ? 'left-[22px] bg-gold' : 'left-0.5 bg-muted-foreground'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
