export type BrandTier = 'premium' | 'professional' | 'standard' | 'entry'
export type Condition = 'excellent' | 'good' | 'fair' | 'restoration'
export type PianoType = 'grand' | 'upright' | 'digital'

// Base values by tier and body type, in USD. These anchor the estimate range.
const BASE_VALUE: Record<PianoType, Record<BrandTier, number>> = {
  grand: { premium: 42000, professional: 22000, standard: 11000, entry: 5000 },
  upright: { premium: 9000, professional: 5200, standard: 2800, entry: 1400 },
  digital: { premium: 1800, professional: 1100, standard: 600, entry: 280 },
}

const CONDITION_FACTOR: Record<Condition, number> = {
  excellent: 1,
  good: 0.82,
  fair: 0.6,
  restoration: 0.35,
}

export const BRAND_TIERS: { value: BrandTier; label: string; hint: string }[] = [
  { value: 'premium', label: 'Premium', hint: 'Steinway, Bösendorfer, Fazioli' },
  { value: 'professional', label: 'Professional', hint: 'Yamaha, Kawai, Bechstein' },
  { value: 'standard', label: 'Standard', hint: 'Baldwin, Samick, Pearl River' },
  { value: 'entry', label: 'Entry', hint: 'Casio, Roland home, unbranded' },
]

export const CONDITIONS: { value: Condition; label: string; hint: string }[] = [
  { value: 'excellent', label: 'Excellent', hint: 'As-new, recently serviced' },
  { value: 'good', label: 'Good', hint: 'Minor wear, plays well' },
  { value: 'fair', label: 'Fair', hint: 'Visible wear, needs tuning' },
  { value: 'restoration', label: 'For restoration', hint: 'Significant work required' },
]

export const PIANO_TYPES: { value: PianoType; label: string }[] = [
  { value: 'grand', label: 'Grand' },
  { value: 'upright', label: 'Upright' },
  { value: 'digital', label: 'Digital' },
]

// Age depreciation: pianos are durable; ~0.7% per year, floored so vintage
// premium instruments retain value.
function ageFactor(year: number) {
  const age = Math.max(0, new Date().getFullYear() - year)
  return Math.max(0.45, 1 - age * 0.007)
}

export type EstimateInput = {
  type: PianoType
  tier: BrandTier
  condition: Condition
  year: number
}

export type EstimateResult = {
  low: number
  high: number
  mid: number
}

export function estimateTradeIn({ type, tier, condition, year }: EstimateInput): EstimateResult {
  const base = BASE_VALUE[type][tier]
  const value = base * CONDITION_FACTOR[condition] * ageFactor(year)
  const mid = Math.round(value / 100) * 100
  return {
    mid,
    low: Math.round((mid * 0.88) / 100) * 100,
    high: Math.round((mid * 1.12) / 100) * 100,
  }
}

export const formatUSD = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export type TradeInStatus = 'submitted' | 'appraised' | 'offer' | 'accepted'

export const TRADE_IN_STAGES: { key: TradeInStatus; label: string }[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'appraised', label: 'Appraised' },
  { key: 'offer', label: 'Offer made' },
  { key: 'accepted', label: 'Accepted' },
]
