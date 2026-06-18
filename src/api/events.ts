import type { Event } from '../types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(`${BASE}/events`)
  if (!res.ok) throw new Error(`Failed to load events (${res.status})`)
  return res.json()
}

export async function fetchEventBySlug(slug: string): Promise<Event> {
  const res = await fetch(`${BASE}/events/${encodeURIComponent(slug)}`)
  if (!res.ok) throw new Error(`Event not found (${res.status})`)
  return res.json()
}
