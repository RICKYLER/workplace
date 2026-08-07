import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductDetail } from '@/components/product-detail'
import { products } from '@/lib/products'

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export default async function PianoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) notFound()
  return (
    <>
      <SiteHeader />
      <ProductDetail product={product} />
      <SiteFooter />
    </>
  )
}
