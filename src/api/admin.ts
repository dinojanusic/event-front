import type { AdminOrder, AdminOrderDetail, InventoryTier, PaginatedResponse } from '../types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export class AdminAuthError extends Error {
  constructor() {
    super('Invalid or missing admin key')
    this.name = 'AdminAuthError'
  }
}

function adminHeaders(key: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Key': key,
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new AdminAuthError()
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export async function fetchAdminOrders(
  key: string,
  page = 1,
  status?: string,
): Promise<PaginatedResponse<AdminOrder>> {
  const params = new URLSearchParams({ page: String(page) })
  if (status) params.set('status', status)
  const res = await fetch(`${BASE}/admin/orders?${params}`, { headers: adminHeaders(key) })
  return handleResponse<PaginatedResponse<AdminOrder>>(res)
}

export async function fetchAdminOrder(
  key: string,
  orderNumber: string,
): Promise<AdminOrderDetail> {
  const res = await fetch(
    `${BASE}/admin/orders/${encodeURIComponent(orderNumber)}`,
    { headers: adminHeaders(key) },
  )
  return handleResponse<AdminOrderDetail>(res)
}

export async function cancelAdminOrder(
  key: string,
  orderNumber: string,
): Promise<AdminOrderDetail> {
  const res = await fetch(
    `${BASE}/admin/orders/${encodeURIComponent(orderNumber)}/cancel`,
    { method: 'POST', headers: adminHeaders(key) },
  )
  return handleResponse<AdminOrderDetail>(res)
}

export async function fetchInventory(key: string, page = 1): Promise<PaginatedResponse<InventoryTier>> {
  const res = await fetch(`${BASE}/admin/inventory?page=${page}`, { headers: adminHeaders(key) })
  return handleResponse<PaginatedResponse<InventoryTier>>(res)
}
