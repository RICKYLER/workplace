'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type User = {
  id?: string
  name: string
  email: string
  role?: string
}

type AuthContextValue = {
  user: User | null
  ready: boolean
  signIn: (email: string, name?: string, role?: string, id?: string) => void
  register: (name: string, email: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'atelier-noir-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  // Restore session on load so user remains authenticated
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      // ignore
    }
    setReady(true)
  }, [])

  function persist(next: User | null) {
    setUser(next)
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const value: AuthContextValue = {
    user,
    ready,
    signIn: (email, name, role, id) =>
      persist({
        id: id || email,
        email,
        name: name || email.split('@')[0].replace(/^\w/, (c) => c.toUpperCase()),
        role: role || (email.includes('robert') || email.includes('ara') ? 'admin' : 'customer'),
      }),
    register: (name, email) => persist({ name, email, role: 'customer' }),
    signOut: () => persist(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
