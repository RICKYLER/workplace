'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Wordmark } from '@/components/wordmark'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'register'

const inputClass =
  'w-full border border-input bg-secondary/40 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/40'

const labelClass = 'mb-2 block text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground'

function PasswordStrength({ length }: { length: number }) {
  const score = length >= 12 ? 3 : length >= 8 ? 2 : length > 0 ? 1 : 0
  const label =
    score === 3
      ? 'Strong password'
      : score === 2
      ? 'Good password'
      : score === 1
      ? 'Add more characters'
      : 'Use at least 8 characters'
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((item) => (
          <span
            key={item}
            className={`h-1 flex-1 ${item < score ? 'bg-gold' : 'bg-border'}`}
          />
        ))}
      </div>
      <p className="mt-1 text-[0.6rem] text-muted-foreground">{label}</p>
    </div>
  )
}

export function AuthForm({ initialMode = 'register' }: { initialMode?: Mode }) {
  const router = useRouter()
  const { signIn, register } = useAuth()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordLength, setPasswordLength] = useState(0)
  const [accepted, setAccepted] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [registeredSuccess, setRegisteredSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendNotice, setResendNotice] = useState('')

  async function handleResendVerification(targetEmail: string) {
    const emailToUse = targetEmail || unverifiedEmail
    if (!emailToUse) return
    setResending(true)
    setResendNotice('')
    try {
      const res = await fetch('/api/clients/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend email')
      setResendNotice('✅ Verification email sent! Check your Gmail inbox.')
    } catch (err: unknown) {
      setResendNotice('❌ ' + (err instanceof Error ? err.message : 'Failed to send email.'))
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setResendNotice('')
    setLoading(true)

    const data = new FormData(e.currentTarget)
    const email = String(data.get('email') || '').trim()
    const password = String(data.get('password') || '')

    try {
      if (mode === 'register') {
        const name = String(data.get('name') || '').trim()
        const confirm = String(data.get('confirm') || '')
        if (!name || !email || !password) {
          setLoading(false)
          return setError('Please complete every field.')
        }
        if (password !== confirm) {
          setLoading(false)
          return setError('Passwords do not match.')
        }
        if (!accepted) {
          setLoading(false)
          return setError('Please accept the showroom terms to continue.')
        }

        const res = await fetch('/api/clients/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName: name, email, password }),
        })
        const result = await res.json()

        if (!res.ok || result.error) {
          setError(result.error || 'Failed to create account. Please try again.')
          setLoading(false)
          return
        }

        setUnverifiedEmail(email)
        setRegisteredSuccess(true)
        setSuccessMsg(result.message || 'Account created! Please check your email to verify.')
      } else {
        if (!email || !password) {
          setLoading(false)
          return setError('Enter your email/username and password.')
        }

        const res = await fetch('/api/clients/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const result = await res.json()

        if (!res.ok || result.error) {
          if (res.status === 403 || result.unverified) {
            setUnverifiedEmail(email)
          }
          setError(result.error || 'Invalid credentials. Please try again.')
          setLoading(false)
          return
        }

        const u = result.user || {}
        signIn(u.email || email, u.fullName || email.split('@')[0], u.role || 'customer', u.id)

        if (u.role === 'admin' || u.workspace) {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred. Please check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  const isRegister = mode === 'register'

  return (
    <div className="w-full max-w-md">
      <Wordmark className="text-2xl" />

      <h1 className="mt-10 font-serif text-4xl font-medium leading-tight md:text-5xl">
        {isRegister ? 'Create an account' : 'Welcome back'}
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        {isRegister
          ? 'Register to reserve instruments and manage piano services.'
          : 'Sign in to manage your orders, trade-ins, and admin workspace.'}
      </p>

      {/* Tabs */}
      <div className="mt-8 grid grid-cols-2 gap-2 border border-border p-1">
        {(['signin', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m)
              setError('')
              setSuccessMsg('')
            }}
            className={cn(
              'py-3 text-[0.65rem] uppercase tracking-[0.25em] transition-colors',
              mode === m
                ? 'bg-gold-gradient text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m === 'signin' ? 'Sign in' : 'Register'}
          </button>
        ))}
      </div>

      {registeredSuccess ? (
        <div className="mt-8 rounded-lg border border-gold/40 bg-secondary/30 p-6 text-center space-y-4">
          <div className="text-4xl">📧</div>
          <h2 className="text-xl font-serif font-medium text-foreground">Check Your Gmail Inbox!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Na-send na ang confirmation email sa imong Gmail: <strong className="text-gold">{unverifiedEmail}</strong>.
          </p>
          <div className="rounded-md border border-dashed border-gold/40 bg-background/60 p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-gold">📩 Step 1: Open your Gmail Inbox</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Palihug i-open ang imong Gmail ug i-click ang <strong>&quot;👉 CLICK HERE TO CONFIRM &amp; REGISTER OFFICIAL 👈&quot;</strong> button para ma-official ang imong account bago ka maka-login.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href={`/verify?email=${encodeURIComponent(unverifiedEmail)}`}
              className="flex w-full items-center justify-center gap-2 bg-gold-gradient py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground rounded"
            >
              Verify Account / Enter Code <span>→</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setRegisteredSuccess(false)
                setMode('signin')
              }}
              className="text-xs text-muted-foreground hover:text-gold"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          {isRegister && (
            <div>
              <label htmlFor="name" className={labelClass}>
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Maria Reyes"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className={labelClass}>
              Email or Username
            </label>
            <input
              id="email"
              name="email"
              type="text"
              placeholder="you@email.com or admin username"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
                onChange={(event) => setPasswordLength(event.target.value.length)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {isRegister && <PasswordStrength length={passwordLength} />}
          </div>

          {isRegister && (
            <div>
              <label htmlFor="confirm" className={labelClass}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          )}

          {!isRegister && (
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setResetSent(true)}
                className="text-xs text-muted-foreground hover:text-gold"
              >
                Forgot password?
              </button>
              {resetSent && (
                <p className="text-[0.65rem] text-gold">Reset instructions sent if an account exists.</p>
              )}
            </div>
          )}

          {error && (
            <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive space-y-2">
              <p className="font-medium">⚠️ {error}</p>
              {unverifiedEmail && (
                <div className="flex flex-col gap-2 pt-1 border-t border-destructive/20">
                  <Link
                    href={`/verify?email=${encodeURIComponent(unverifiedEmail)}`}
                    className="inline-block font-semibold text-gold hover:underline text-[0.75rem]"
                  >
                    👉 Click here to verify account now <span>→</span>
                  </Link>
                  <button
                    type="button"
                    disabled={resending}
                    onClick={() => handleResendVerification(unverifiedEmail)}
                    className="text-left text-[0.75rem] text-muted-foreground hover:text-foreground underline"
                  >
                    {resending ? 'Sending...' : '🔄 Resend Verification Email'}
                  </button>
                </div>
              )}
            </div>
          )}
          {resendNotice && <p className="text-xs text-gold font-medium">{resendNotice}</p>}
          {successMsg && <p className="text-xs text-gold font-medium">{successMsg}</p>}

          {isRegister && (
            <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-0.5 size-4 accent-gold"
              />
              <span>I agree to the showroom terms and privacy policy.</span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-gold-gradient py-4 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      )}

      <div className="my-8 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Or
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={() => {
          signIn('guest@ateliernoir.com', 'Guest')
          router.push('/dashboard')
        }}
        className="w-full border border-border py-4 text-[0.7rem] uppercase tracking-[0.25em] text-foreground transition-colors hover:border-gold/50 hover:text-gold"
      >
        Continue as Guest
      </button>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-gold">
          ← Back to the collection
        </Link>
      </p>
    </div>
  )
}
