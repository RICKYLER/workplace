import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Jost } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Atelier Noir — Handcrafted Pianos',
  description:
    'A small, obsessive collection of grands, uprights and stage pianos, each voiced by hand before it leaves the atelier. Est. 1974 — Manila & Kyoto.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0c0a08',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-background ${playfair.variable} ${jost.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
