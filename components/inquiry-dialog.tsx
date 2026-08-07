'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Check, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { formatPrice, type Product } from '@/lib/products'
import { SHOWROOM_RULES } from '@/lib/showroom-rules'
import { cn } from '@/lib/utils'

type Intent = 'inquire' | 'order'
type Step = 'rules' | 'form' | 'done'

export function InquiryDialog({
  product,
  intent = 'inquire',
  open,
  onClose,
}: {
  product: Product
  intent?: Intent
  open: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState<Step>('rules')
  const [agreed, setAgreed] = useState(false)

  // reset whenever the dialog is opened
  useEffect(() => {
    if (open) {
      setStep('rules')
      setAgreed(false)
    }
  }, [open])

  // lock body scroll + escape to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const isOrder = intent === 'order'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      {/* backdrop */}
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-background/85 backdrop-blur-sm"
      />

      {/* panel */}
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden border border-border bg-card shadow-2xl">
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="relative hidden size-16 shrink-0 overflow-hidden border border-border md:block">
              <Image
                src={product.image || '/placeholder.svg'}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold">
                {isOrder ? 'Place an order' : 'Inquire'}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-medium leading-tight">{product.name}</h2>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                {product.finish} · {formatPrice(product.price)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* step indicator */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-3 md:px-8">
          <StepDot n={1} label="Read the rules" active={step === 'rules'} done={step !== 'rules'} />
          <span className="h-px w-6 bg-border" />
          <StepDot n={2} label={isOrder ? 'Order details' : 'Your inquiry'} active={step === 'form'} done={step === 'done'} />
          <span className="h-px w-6 bg-border" />
          <StepDot n={3} label="Sent" active={step === 'done'} done={false} />
        </div>

        {/* body (scrolls) */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
          {step === 'rules' && (
            <RulesStep
              agreed={agreed}
              setAgreed={setAgreed}
              onContinue={() => setStep('form')}
            />
          )}
          {step === 'form' && (
            <FormStep
              isOrder={isOrder}
              onBack={() => setStep('rules')}
              onSubmit={() => setStep('done')}
            />
          )}
          {step === 'done' && <DoneStep isOrder={isOrder} product={product} onClose={onClose} />}
        </div>
      </div>
    </div>
  )
}

function StepDot({
  n,
  label,
  active,
  done,
}: {
  n: number
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'grid size-6 place-items-center rounded-full border text-[0.6rem]',
          active
            ? 'border-gold bg-gold/10 text-gold'
            : done
              ? 'border-gold/50 text-gold'
              : 'border-border text-muted-foreground',
        )}
      >
        {done ? <Check className="size-3" /> : n}
      </span>
      <span
        className={cn(
          'hidden text-[0.6rem] uppercase tracking-[0.15em] sm:inline',
          active ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
    </div>
  )
}

function RulesStep({
  agreed,
  setAgreed,
  onContinue,
}: {
  agreed: boolean
  setAgreed: (v: boolean) => void
  onContinue: () => void
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-gold">
        <ShieldCheck className="size-4" />
        <p className="text-[0.65rem] uppercase tracking-[0.25em]">Showroom terms</p>
      </div>
      <h3 className="mt-3 font-serif text-2xl font-medium">Please read before you continue</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        These terms apply to every inquiry and order placed with the atelier. You must accept them to
        proceed.
      </p>

      <div className="mt-6 space-y-4">
        {SHOWROOM_RULES.map((rule) => (
          <div key={rule.title} className="border border-border bg-background/40 p-5">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-gold">{rule.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rule.body}</p>
          </div>
        ))}
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 border border-border p-5 transition-colors hover:border-gold/40">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-gold"
        />
        <span className="text-sm leading-relaxed text-foreground">
          I have read and agree to the showroom terms, delivery lead times, and privacy policy above.
        </span>
      </label>

      <div className="mt-6 flex justify-end">
        <button
          disabled={!agreed}
          onClick={onContinue}
          className={cn(
            'flex items-center gap-2 px-7 py-3 text-[0.65rem] uppercase tracking-[0.2em] transition-opacity',
            agreed
              ? 'bg-gold-gradient text-primary-foreground hover:opacity-90'
              : 'cursor-not-allowed border border-border text-muted-foreground',
          )}
        >
          Continue <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

function FormStep({
  isOrder,
  onBack,
  onSubmit,
}: {
  isOrder: boolean
  onBack: () => void
  onSubmit: () => void
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <h3 className="font-serif text-2xl font-medium">
        {isOrder ? 'Your order details' : 'Tell us how to help'}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        A specialist will respond within one business day
        {isOrder ? ' to confirm your reservation deposit.' : '.'}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required>
          <input className="atelier-input" placeholder="Maria Reyes" required />
        </Field>
        <Field label="Email" required>
          <input type="email" className="atelier-input" placeholder="you@email.com" required />
        </Field>
        <Field label="Phone" required={isOrder}>
          <input className="atelier-input" placeholder="+63 917 000 0000" required={isOrder} />
        </Field>
        <Field label="Preferred showroom">
          <select className="atelier-input" defaultValue="Manila">
            <option>Manila</option>
            <option>Kyoto</option>
          </select>
        </Field>
      </div>

      {isOrder ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Delivery city" required>
            <input className="atelier-input" placeholder="Makati City" required />
          </Field>
          <Field label="Preferred delivery window">
            <select className="atelier-input" defaultValue="4–8 weeks (standard)">
              <option>4–8 weeks (standard)</option>
              <option>As soon as possible</option>
              <option>Flexible / no rush</option>
            </select>
          </Field>
        </div>
      ) : null}

      <div className="mt-5">
        <Field label={isOrder ? 'Notes for the atelier' : 'What would you like to know?'}>
          <textarea
            rows={4}
            className="atelier-input resize-none"
            placeholder={
              isOrder
                ? 'Any customization, financing questions, or delivery access notes…'
                : 'Ask about tone, home fit, financing, delivery, or aftercare…'
            }
          />
        </Field>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to terms
        </button>
        <button
          type="submit"
          className="bg-gold-gradient px-7 py-3 text-[0.65rem] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          {isOrder ? 'Reserve this instrument' : 'Send inquiry'}
        </button>
      </div>
    </form>
  )
}

function DoneStep({
  isOrder,
  product,
  onClose,
}: {
  isOrder: boolean
  product: Product
  onClose: () => void
}) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full border border-gold/50 bg-gold/10 text-gold">
        <Check className="size-6" />
      </div>
      <h3 className="mt-5 font-serif text-3xl font-medium">
        {isOrder ? 'Reservation received' : 'Inquiry sent'}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Thank you for your interest in the{' '}
        <span className="text-foreground">{product.name}</span>. A specialist will contact you within
        one business day
        {isOrder ? ' with deposit and delivery details.' : '.'}
      </p>
      <button
        onClick={onClose}
        className="mt-7 border border-border px-7 py-3 text-[0.65rem] uppercase tracking-[0.2em] text-foreground transition-colors hover:border-gold/50 hover:text-gold"
      >
        Close
      </button>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </span>
      {children}
    </label>
  )
}
