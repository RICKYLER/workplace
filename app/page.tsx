import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Hero } from '@/components/home/hero'
import { Collection } from '@/components/home/collection'
import { Atelier } from '@/components/home/atelier'
import { Service } from '@/components/home/service'
import { Trust } from '@/components/home/trust'
import { FloatingHelp } from '@/components/floating-help'
import { Voices } from '@/components/home/voices'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Trust />
        <Collection />
        <Atelier />
        <Voices />
        <Service />
      </main>
      <FloatingHelp />
      <SiteFooter />
    </>
  )
}
