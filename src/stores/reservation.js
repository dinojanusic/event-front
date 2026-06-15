import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'event:reservation'

function loadFromSession() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    return null
  }
}

export const useReservationStore = defineStore('reservation', () => {
  const saved = loadFromSession()

  // Each item: { uuid, expiresAt, tierId, tierName, quantity, price, currency }
  const items = ref(saved?.items ?? [])

  const hasReservation = computed(() => items.value.length > 0)

  // The soonest expiry across all held items drives the countdown
  const expiresAt = computed(() => {
    if (!items.value.length) return null
    return Math.min(...items.value.map(i => i.expiresAt))
  })

  const isActive = computed(
    () => hasReservation.value && expiresAt.value != null && expiresAt.value * 1000 > Date.now(),
  )

  function set(newItems) {
    items.value = newItems
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ items: newItems }))
  }

  function clear() {
    items.value = []
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { items, hasReservation, expiresAt, isActive, set, clear }
})
