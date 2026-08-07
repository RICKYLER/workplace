import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CompareView } from '@/components/compare-view'

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ add?: string }> }) {
  const { add } = await searchParams
  return (
    <>
      <SiteHeader />
      <CompareView initialId={add} />
      <SiteFooter />
    </>
  )
}
