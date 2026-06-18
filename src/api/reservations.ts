import type { ReservationResult, OrderResult } from '../types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export class ReservationExpiredError extends Error {
  readonly code = 'RESERVATION_EXPIRED' as const
  constructor() {
    super('Your reservation has expired. Please try again.')
  }
}

export async function createReservation(
  tierId: string,
  quantity: number,
): Promise<ReservationResult> {
  const res = await fetch(`${BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tierId, quantity }),
  })
  if (res.status === 409) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      (body as { error?: string }).error ??
        'Sorry, those tickets just sold out. Try selecting fewer or check back later.',
    )
  }
  if (!res.ok) throw new Error(`Reservation failed (${res.status})`)
  return res.json()
}

export async function releaseReservation(uuid: string): Promise<void> {
  try {
    await fetch(`${BASE}/reservations/${encodeURIComponent(uuid)}`, { method: 'DELETE' })
  } catch {
    // Best-effort; backend TTL cleans up regardless
  }
}

export async function placeOrder(reservationUuid: string, email: string): Promise<OrderResult> {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reservationUuid, email }),
  })
  if (res.status === 410) throw new ReservationExpiredError()
  if (!res.ok) throw new Error(`Order failed (${res.status})`)
  return res.json()
}
