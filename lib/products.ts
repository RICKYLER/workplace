export type Product = {
  id: string
  name: string
  category: 'Grand' | 'Upright' | 'Digital'
  finish: string
  price: number
  image: string
  blurb: string
}

export const products: Product[] = [
  {
    id: 'noir-concert-d',
    name: 'Noir Concert D',
    category: 'Grand',
    finish: 'Ebony High-Gloss',
    price: 148000,
    image: '/images/product-grand.png',
    blurb: 'A 274cm concert grand voiced for the recital hall — vast dynamic range, singing treble.',
  },
  {
    id: 'salon-a',
    name: 'Salon A',
    category: 'Grand',
    finish: 'Ebony High-Gloss',
    price: 62000,
    image: '/images/product-grand.png',
    blurb: 'A 188cm baby grand built for the living room, with the soul of a much larger instrument.',
  },
  {
    id: 'kyoto-upright-u3',
    name: 'Kyoto Upright U3',
    category: 'Upright',
    finish: 'Ebony Satin',
    price: 18400,
    image: '/images/product-upright.png',
    blurb: 'A 131cm professional upright — the atelier standard for studios and conservatories.',
  },
  {
    id: 'manila-upright-classic',
    name: 'Manila Classic',
    category: 'Upright',
    finish: 'Walnut Satin',
    price: 12900,
    image: '/images/product-upright.png',
    blurb: 'A warm 121cm upright in hand-finished walnut, tuned for the home and the teacher.',
  },
  {
    id: 'stage-88',
    name: 'Stage 88',
    category: 'Digital',
    finish: 'Matte Black',
    price: 4200,
    image: '/images/product-digital.png',
    blurb: 'A fully weighted digital stage piano with sampled Noir Concert D voices, for the road.',
  },
  {
    id: 'studio-73',
    name: 'Studio 73',
    category: 'Digital',
    finish: 'Matte Black',
    price: 2800,
    image: '/images/product-digital.png',
    blurb: 'A compact 73-key controller-piano for the home studio, with hammer-action keys.',
  },
]

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value,
  )
