export interface Tier {
  id: string
  name: string
  price: number | null
  currency: string
  available: number | null
  quota?: number | null
  salesEnd?: string | null
}

export interface Event {
  id: string | number
  slug: string
  name: string
  startDate: string | null
  endDate?: string | null
  venue?: string | null
  heroImage?: string | null
  description?: string | null
  ticketTiers?: Tier[]
}

export interface ReservationItem {
  uuid: string
  expiresAt: number
  tierId: string
  tierName: string
  quantity: number
  price: number
  currency: string
}

export interface ReservationResult {
  uuid: string
  expiresAt: number
}

export interface OrderResult {
  orderNumber: string
}
