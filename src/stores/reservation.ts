import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReservationItem } from '../types'

const STORAGE_KEY = 'event:reservation'

function loadFromSession(): { items: ReservationItem[] } | null {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    return null
  }
}

export const useReservationStore = defineStore('reservation', () => {
  const saved = loadFromSession()

  const items = ref<ReservationItem[]>(saved?.items ?? [])

  const hasReservation = computed(() => items.value.length > 0)

  // The soonest expiry across all held items drives the countdown
  const expiresAt = computed(() => {
    if (!items.value.length) return null
    return Math.min(...items.value.map(i => i.expiresAt))
  })

  const isActive = computed(
    () => hasReservation.value && expiresAt.value != null && expiresAt.value * 1000 > Date.now(),
  )

  function set(newItems: ReservationItem[]): void {
    items.value = newItems
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ items: newItems }))
  }

  function clear(): void {
    items.value = []
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { items, hasReservation, expiresAt, isActive, set, clear }
})
