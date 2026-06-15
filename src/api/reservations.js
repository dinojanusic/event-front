const BASE = '/api/v1'

export async function createReservation(tierId, quantity) {
  const res = await fetch(`${BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tierId, quantity }),
  })
  if (res.status === 409) throw new Error('Not enough tickets available.')
  if (!res.ok) throw new Error(`Reservation failed (${res.status})`)
  return res.json() // { uuid, expiresAt }
}

export async function releaseReservation(uuid) {
  try {
    await fetch(`${BASE}/reservations/${encodeURIComponent(uuid)}`, { method: 'DELETE' })
  } catch {
    // Best-effort; backend TTL cleans up regardless
  }
}

export async function placeOrder(reservationUuid, email) {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reservationUuid, email }),
  })
  if (res.status === 410) {
    const err = new Error('Your reservation has expired. Please try again.')
    err.code = 'RESERVATION_EXPIRED'
    throw err
  }
  if (!res.ok) throw new Error(`Order failed (${res.status})`)
  return res.json() // { orderNumber }
}
