import type { OrderDetail } from '../types'

export class OrderNotFoundError extends Error {
  constructor() {
    super('Order not found')
    this.name = 'OrderNotFoundError'
  }
}

export async function fetchOrder(orderNumber: string, email: string): Promise<OrderDetail> {
  const url = `/api/v1/orders/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`
  const res = await fetch(url)

  if (res.status === 404) {
    throw new OrderNotFoundError()
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Unexpected error (${res.status})`)
  }

  return res.json() as Promise<OrderDetail>
}
