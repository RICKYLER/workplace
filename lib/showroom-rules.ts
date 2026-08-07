export type Rule = {
  title: string
  body: string
}

// Terms a client must read & accept before submitting an inquiry or order.
export const SHOWROOM_RULES: Rule[] = [
  {
    title: '01 — Reservation & deposit',
    body: 'An instrument is only held once a refundable reservation deposit of 10% is received. Until then, availability is not guaranteed and pricing may change.',
  },
  {
    title: '02 — Hand-voicing lead time',
    body: 'Every grand and upright is voiced and regulated by hand before delivery. Please allow 4–8 weeks from confirmed order; digital instruments ship within 5 business days.',
  },
  {
    title: '03 — Delivery & installation',
    body: 'White-glove delivery, positioning and first on-site tuning are included within Metro Manila and Kyoto city. Locations beyond these are quoted individually.',
  },
  {
    title: '04 — Warranty & servicing',
    body: 'Acoustic instruments carry a 10-year atelier warranty; digital instruments carry 3 years. The first two annual tunings are complimentary.',
  },
  {
    title: '05 — Returns & exchange',
    body: 'Acoustic instruments may be exchanged toward another piano within 12 months, with the full purchase value credited (see our trade-in terms). Custom finishes are final sale.',
  },
  {
    title: '06 — Privacy',
    body: 'Your details are used solely to process this inquiry and are never shared. A specialist will respond within one business day.',
  },
]
