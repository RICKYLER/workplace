'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import {
  BRAND_TIERS,
  CONDITIONS,
  PIANO_TYPES,
  estimateTradeIn,
  formatUSD,
  type BrandTier,
  type Condition,
  type PianoType,
} from '@/lib/trade-in'
import { cn } from '@/lib/utils'

const CURRENT_YEAR = new Date().getFullYear()

type FormState = {
  type: PianoType | null
  tier: BrandTier | null
  condition: Condition | null
  brandModel: string
  year: string
  name: string
  email: string
  notes: string
}

const INITIAL: FormState = {
  type: null,
  tier: null,
  condition: null,
  brandModel: '',
  year: '',
  name: '',
  email: '',
  notes: '',
}

const STEPS = ['Instrument', 'Details', 'Estimate', 'Contact'] as const

export function TradeInForm() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [submitted, setSubmitted] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const yearNum = Number.parseInt(form.year, 10)
  const yearValid = form.year.length === 4 && yearNum >= 1900 && yearNum <= CURRENT_YEAR

  const estimate = useMemo(() => {
    if (!form.type || !form.tier || !form.condition || !yearValid) return null
    return estimateTradeIn({ type: form.type, tier: form.tier, condition: form.condition, year: yearNum })
  }, [form.type, form.tier, form.condition, yearValid, yearNum])

  const canAdvance =
    (step === 0 && form.type) ||
    (step === 1 && form.tier && form.condition && form.brandModel.trim() && yearValid) ||
    step === 2 ||
    (step === 3 && form.name.trim() && form.email.trim())

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="border border-border bg-card p-10 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full border border-gold/50">
          <Check className="size-7 text-gold" />
        </div>
        <h2 className="mt-6 font-serif text-3xl font-medium">Request received</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thank you, {form.name.split(' ')[0] || 'friend'}. Our specialists will review your{' '}
          {form.brandModel || 'instrument'} and confirm a firm offer within two business days.
          {estimate && (
            <>
              {' '}
              Your estimated trade-in credit is{' '}
              <span className="text-gold">
                {formatUSD(estimate.low)} – {formatUSD(estimate.high)}
              </span>
              .
            </>
          )}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="bg-gold-gradient px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground"
          >
            Track in dashboard
          </Link>
          <Link
            href="/#collection"
            className="border border-border px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-gold/50 hover:text-gold"
          >
            Browse the collection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border bg-card">
      {/* stepper */}
      <div className="flex border-b border-border">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 border-r border-border px-2 py-4 text-[0.6rem] uppercase tracking-[0.2em] last:border-r-0',
              i === step ? 'text-gold' : i < step ? 'text-foreground/70' : 'text-muted-foreground/50',
            )}
          >
            <span
              className={cn(
                'grid size-5 place-items-center rounded-full border text-[0.6rem]',
                i < step
                  ? 'border-gold/50 bg-gold/10 text-gold'
                  : i === step
                    ? 'border-gold text-gold'
                    : 'border-border',
              )}
            >
              {i < step ? <Check className="size-3" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      <div className="p-6 md:p-10">
        {/* Step 0 — instrument type */}
        {step === 0 && (
          <div>
            <h2 className="font-serif text-2xl font-medium">What are you trading?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Choose the body type of your instrument.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {PIANO_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('type', t.value)}
                  className={cn(
                    'border p-8 text-center transition-colors',
                    form.type === t.value
                      ? 'border-gold bg-gold/5 text-gold'
                      : 'border-border text-foreground hover:border-gold/40',
                  )}
                >
                  <span className="font-serif text-xl">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — details */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-medium">Tell us about it</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                These details shape your estimate. Be as accurate as you can.
              </p>
            </div>

            <Field label="Brand & model">
              <input
                value={form.brandModel}
                onChange={(e) => set('brandModel', e.target.value)}
                placeholder="e.g. Yamaha C3"
                className="atelier-input"
              />
            </Field>

            <div>
              <FieldLabel>Brand tier</FieldLabel>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {BRAND_TIERS.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => set('tier', b.value)}
                    className={cn(
                      'border p-4 text-left transition-colors',
                      form.tier === b.value ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/40',
                    )}
                  >
                    <span
                      className={cn('block text-sm', form.tier === b.value ? 'text-gold' : 'text-foreground')}
                    >
                      {b.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{b.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Condition</FieldLabel>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set('condition', c.value)}
                    className={cn(
                      'border p-4 text-left transition-colors',
                      form.condition === c.value
                        ? 'border-gold bg-gold/5'
                        : 'border-border hover:border-gold/40',
                    )}
                  >
                    <span
                      className={cn(
                        'block text-sm',
                        form.condition === c.value ? 'text-gold' : 'text-foreground',
                      )}
                    >
                      {c.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{c.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Year made">
              <input
                value={form.year}
                onChange={(e) => set('year', e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder="e.g. 2008"
                className="atelier-input"
              />
              {form.year && !yearValid && (
                <p className="mt-2 text-xs text-destructive">Enter a year between 1900 and {CURRENT_YEAR}.</p>
              )}
            </Field>
          </div>
        )}

        {/* Step 2 — estimate */}
        {step === 2 && (
          <div className="text-center">
            <div className="mx-auto inline-flex items-center gap-2 border border-gold/40 px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.25em] text-gold">
              <Sparkles className="size-3.5" /> Estimated credit
            </div>
            {estimate ? (
              <>
                <p className="mt-8 font-serif text-5xl font-medium text-gold-gradient md:text-6xl">
                  {formatUSD(estimate.low)} – {formatUSD(estimate.high)}
                </p>
                <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Based on a {form.condition} condition {form.brandModel} from {form.year}. This is an
                  indicative range — our specialists confirm a firm offer after inspection.
                </p>
                <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 border border-border">
                  {[
                    ['Type', PIANO_TYPES.find((t) => t.value === form.type)?.label],
                    ['Tier', BRAND_TIERS.find((t) => t.value === form.tier)?.label],
                    ['Condition', CONDITIONS.find((c) => c.value === form.condition)?.label],
                  ].map(([k, v]) => (
                    <div key={k} className="border-r border-border p-4 last:border-r-0">
                      <dt className="text-[0.55rem] uppercase tracking-[0.15em] text-muted-foreground">{k}</dt>
                      <dd className="mt-1 text-sm text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="mt-8 text-sm text-muted-foreground">
                Complete the previous step to see your estimate.
              </p>
            )}
          </div>
        )}

        {/* Step 3 — contact */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-medium">Where do we send the offer?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A specialist will reach out to arrange inspection and pickup.
              </p>
            </div>
            <Field label="Full name">
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Maria Reyes"
                className="atelier-input"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@email.com"
                className="atelier-input"
              />
            </Field>
            <Field label="Notes (optional)">
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                placeholder="Anything we should know — service history, location, urgency."
                className="atelier-input resize-none"
              />
            </Field>
          </div>
        )}

        {/* nav */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={cn(
              'flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition-colors',
              step === 0 ? 'pointer-events-none opacity-0' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <ChevronLeft className="size-4" /> Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance}
            className="flex items-center gap-2 bg-gold-gradient px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === STEPS.length - 1 ? 'Submit request' : step === 2 ? 'Continue' : 'Next'}
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-3">{children}</div>
    </label>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{children}</span>
}
