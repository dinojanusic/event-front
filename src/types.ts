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

export interface OrderDetail {
  orderNumber: string
  status: string
  quantity: number
  totalPrice: string
  currency: string
  tierName: string
  eventName: string
  eventStartDate: string | null
  eventSlug: string
  venueName: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface AdminOrder {
  orderNumber: string
  email: string
  status: string
  quantity: number
  totalPrice: string
  currency: string
  tierName: string
  eventName: string
  createdAt: string | null
}

export interface AdminOrderDetail extends AdminOrder {
  eventSlug: string
  venueName: string
  eventStartDate: string | null
}

export interface InventoryTier {
  tierId: number
  tierName: string
  eventName: string
  quota: number
  available: number
  currency: string
  price: number | null
}
